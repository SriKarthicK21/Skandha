import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Activity,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  RefreshCw,
  PlusCircle,
  User,
  Hash,
  ChevronDown,
  ChevronUp,
  Eye,
  Flame,
  Sparkles,
  Calendar,
  X,
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export type ActivityCategoryFilter = 'all' | 'evidence' | 'risk' | 'policy' | 'audit';

export interface RecentActivityItem {
  id: string;
  category: 'evidence' | 'risk' | 'policy' | 'audit';
  actionType:
    | 'EVIDENCE_UPLOAD'
    | 'EVIDENCE_VERIFIED'
    | 'RISK_ASSESSED'
    | 'RISK_TREATED'
    | 'POLICY_UPDATED'
    | 'POLICY_SIGNED'
    | 'POLICY_ACKNOWLEDGED'
    | 'AUDIT_LOG';
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  relativeTime: string;
  moduleId: string;
  moduleName: string;
  statusBadge: {
    label: string;
    variant: 'emerald' | 'amber' | 'blue' | 'rose' | 'indigo' | 'slate';
  };
  controlCode?: string;
  sha256Hash?: string;
  metadata?: Record<string, any>;
  isSimulated?: boolean;
}

interface RecentActivityFeedProps {
  onNavigateModule: (moduleId: string) => void;
  maxInitialDisplay?: number;
  showHeaderControls?: boolean;
  className?: string;
}

// Utility to calculate human-readable relative time
function getRelativeTime(timestamp: string): string {
  try {
    const now = new Date().getTime();
    const date = new Date(timestamp).getTime();
    if (isNaN(date)) return 'Recently';

    const diffMs = now - date;
    if (diffMs < 0) return 'Just now';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  onNavigateModule,
  maxInitialDisplay = 8,
  showHeaderControls = true,
  className = ''
}) => {
  const {
    currentTenant,
    currentUser,
    currentRole,
    auditTrail,
    evidence,
    risks,
    generatedDocs,
    documentAcknowledgments,
    theme,
    logAuditEvent,
    uploadEvidence,
    addRisk
  } = useGRC();

  const [categoryFilter, setCategoryFilter] = useState<ActivityCategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Verified' | 'Pending Review'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<RecentActivityItem | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [isSimulatingAction, setIsSimulatingAction] = useState<boolean>(false);
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);

  // Periodic Auto-Refresh state & controls (Default: every 60 seconds)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(60);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [isIntervalMenuOpen, setIsIntervalMenuOpen] = useState<boolean>(false);
  const [justRefreshedNotice, setJustRefreshedNotice] = useState<boolean>(false);

  // Trigger manual or automatic feed refresh
  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setJustRefreshedNotice(true);
    const now = new Date();
    setLastUpdated(now);
    setRefreshTick(prev => prev + 1);
    setCountdown(autoRefreshInterval);

    const spinTimer = setTimeout(() => {
      setIsRefreshing(false);
    }, 600);

    const noticeTimer = setTimeout(() => {
      setJustRefreshedNotice(false);
    }, 2500);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(noticeTimer);
    };
  }, [autoRefreshInterval]);

  // Periodic Auto-refresh timer countdown (every 1 second)
  useEffect(() => {
    if (!isAutoRefreshEnabled || autoRefreshInterval <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerRefresh();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefreshEnabled, autoRefreshInterval, triggerRefresh]);

  // Handle selecting auto-refresh interval (30s, 60s, 120s, or pause)
  const handleSelectInterval = (seconds: number) => {
    if (seconds === 0) {
      setIsAutoRefreshEnabled(false);
    } else {
      setIsAutoRefreshEnabled(true);
      setAutoRefreshInterval(seconds);
      setCountdown(seconds);
    }
    setIsIntervalMenuOpen(false);
  };

  // Formatted Last Updated time string
  const lastUpdatedTimeFormatted = useMemo(() => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [lastUpdated]);

  // Relative elapsed time since last update
  const relativeLastUpdated = useMemo(() => {
    const diffSec = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  }, [lastUpdated, countdown]);

  // 1. Synthesize all live significant user actions chronologically
  const unifiedActivities = useMemo<RecentActivityItem[]>(() => {
    const list: RecentActivityItem[] = [];
    const tenantId = currentTenant?.id;

    // A. Significant Evidence Uploads & Reviews
    const tenantEvidence = tenantId ? evidence.filter(e => e.tenantId === tenantId) : evidence;
    tenantEvidence.forEach(e => {
      // Evidence Upload action
      const isVerified = e.status === 'Verified';
      list.push({
        id: `ev-up-${e.id}`,
        category: 'evidence',
        actionType: 'EVIDENCE_UPLOAD',
        title: `Evidence Uploaded: ${e.title}`,
        description: `Deposited file "${e.fileName}" (${e.fileSize || '2.1 MB'}) for control ${e.controlCode} (${e.department}).`,
        actorName: e.uploadedBy || e.submittedBy || 'Priya Sharma (DevOps Lead)',
        actorRole: 'Evidence Contributor',
        timestamp: e.uploadedDate || e.submittedDate || '2026-08-20T10:00:00Z',
        relativeTime: getRelativeTime(e.uploadedDate || e.submittedDate || '2026-08-20T10:00:00Z'),
        moduleId: 'evidence_centre',
        moduleName: 'Evidence Centre',
        statusBadge: {
          label: isVerified ? 'Verified' : 'Pending Review',
          variant: isVerified ? 'emerald' : 'amber'
        },
        controlCode: e.controlCode,
        sha256Hash: e.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        metadata: {
          fileType: e.fileType,
          tags: e.tags,
          dpdpClauses: e.dpdpClauses
        }
      });

      // If already verified by auditor, add verification milestone
      if (e.reviewedBy && e.reviewDate) {
        list.push({
          id: `ev-ver-${e.id}`,
          category: 'evidence',
          actionType: 'EVIDENCE_VERIFIED',
          title: `Evidence Verified: ${e.controlCode}`,
          description: `Auditor review sign-off: "${e.reviewNotes || 'Cryptographic integrity verified against baseline.'}"`,
          actorName: e.reviewedBy,
          actorRole: 'Lead External Auditor',
          timestamp: e.reviewDate,
          relativeTime: getRelativeTime(e.reviewDate),
          moduleId: 'evidence_centre',
          moduleName: 'Evidence Centre',
          statusBadge: {
            label: 'Verified',
            variant: 'emerald'
          },
          controlCode: e.controlCode,
          sha256Hash: e.sha256Hash,
          metadata: {
            reviewer: e.reviewedBy,
            reviewNotes: e.reviewNotes
          }
        });
      }
    });

    // B. Significant Risk Assessments & Executive Acceptances
    const tenantRisks = tenantId ? risks.filter(r => r.tenantId === tenantId) : risks;
    tenantRisks.forEach(r => {
      // Risk Assessment Action
      const isMonitored = r.status === 'Residual Monitored';
      const isCritical = r.residualScore >= 15;
      const isPending = r.status === 'Assessment' || r.status === 'Identified';
      const statusLabel = isMonitored ? 'Verified' : isCritical ? 'High Risk' : isPending ? 'Pending Review' : 'In Progress';
      const statusVariant = isMonitored ? 'emerald' : isCritical ? 'rose' : isPending ? 'amber' : 'blue';

      list.push({
        id: `rsk-eval-${r.id}`,
        category: 'risk',
        actionType: 'RISK_ASSESSED',
        title: `Risk Assessment: ${r.riskCode}`,
        description: `Assessed "${r.title}". Inherent Score: ${r.inherentScore} (L:${r.likelihood} × I:${r.impact}) -> Residual: ${r.residualScore}. Treatment: ${r.treatmentOption}.`,
        actorName: r.treatmentOwner || 'Enterprise Risk Committee',
        actorRole: 'Risk Assessor',
        timestamp: r.targetDate ? `${r.targetDate}T11:00:00Z` : '2026-08-15T09:00:00Z',
        relativeTime: getRelativeTime(r.targetDate ? `${r.targetDate}T11:00:00Z` : '2026-08-15T09:00:00Z'),
        moduleId: 'risk_management',
        moduleName: 'Risk Register',
        statusBadge: {
          label: statusLabel,
          variant: statusVariant
        },
        controlCode: r.frameworkMappings?.iso27001Controls?.[0] || 'ISO 27001 Cl. 6.1.2',
        metadata: {
          department: r.department,
          inherentScore: r.inherentScore,
          residualScore: r.residualScore,
          treatmentOption: r.treatmentOption
        }
      });

      // Executive Risk Acceptance
      if (r.executiveAcceptance?.status === 'Accepted' && r.executiveAcceptance?.acceptedAt) {
        list.push({
          id: `rsk-acc-${r.id}`,
          category: 'risk',
          actionType: 'RISK_TREATED',
          title: `Executive Risk Acceptance: ${r.riskCode}`,
          description: `Formal acceptance ratified by ${r.executiveAcceptance.acceptedBy}. Justification: "${r.executiveAcceptance.justification || 'Residual risk accepted.'}" Ref: ${r.executiveAcceptance.boardMeetingRef || 'Board Minute Q3'}`,
          actorName: r.executiveAcceptance.acceptedBy || 'SriKarthiK (CISO)',
          actorRole: 'Executive CISO / CRO',
          timestamp: r.executiveAcceptance.acceptedAt,
          relativeTime: getRelativeTime(r.executiveAcceptance.acceptedAt),
          moduleId: 'risk_management',
          moduleName: 'Risk Register',
          statusBadge: {
            label: 'Verified',
            variant: 'emerald'
          },
          controlCode: 'Clause 6.1.3',
          metadata: {
            boardRef: r.executiveAcceptance.boardMeetingRef,
            reviewFrequency: `${r.executiveAcceptance.reviewFrequencyMonths || 12} Months`
          }
        });
      }
    });

    // C. Significant Policy Updates, Approvals & Syntheses
    generatedDocs.forEach(d => {
      const isLockedOrApproved = d.status === 'LOCKED' || d.status === 'APPROVED';
      const isReview = d.status === 'IN_REVIEW';
      list.push({
        id: `pol-upd-${d.id}`,
        category: 'policy',
        actionType: 'POLICY_UPDATED',
        title: `Policy Updated: ${d.title}`,
        description: `Standard policy suite item ${d.docCode || 'POL-SEC-01'} updated. Status: ${d.status}. Owner: ${d.owner || 'Compliance Lead'}, Approver: ${d.approver || 'CISO'}.`,
        actorName: d.owner || 'SriKarthiK (CISO)',
        actorRole: 'Policy Custodian',
        timestamp: d.lastModified || d.effectiveDate || '2026-08-01T14:00:00Z',
        relativeTime: getRelativeTime(d.lastModified || d.effectiveDate || '2026-08-01T14:00:00Z'),
        moduleId: 'policies',
        moduleName: 'Policy Suite',
        statusBadge: {
          label: isLockedOrApproved ? 'Verified' : isReview ? 'Pending Review' : 'Draft',
          variant: isLockedOrApproved ? 'emerald' : isReview ? 'amber' : 'slate'
        },
        controlCode: d.docCode || 'ISO 27001 Cl. 5.2',
        metadata: {
          version: d.version,
          reviewCycle: d.reviewCycle,
          approver: d.approver
        }
      });
    });

    // D. Digital Policy Acknowledgments by Staff
    const tenantAcks = tenantId ? documentAcknowledgments.filter(a => a.tenantId === tenantId) : documentAcknowledgments;
    tenantAcks.forEach(a => {
      list.push({
        id: `pol-ack-${a.id}`,
        category: 'policy',
        actionType: 'POLICY_ACKNOWLEDGED',
        title: `Policy Attestation: ${a.documentTitle}`,
        description: `${a.userName} (${a.department}) executed binding digital attestation for ${a.documentCode} v${a.documentVersion}. Signature: "${a.signatureText}".`,
        actorName: a.userName,
        actorRole: a.userRole,
        timestamp: a.timestamp,
        relativeTime: getRelativeTime(a.timestamp),
        moduleId: 'policies',
        moduleName: 'Policy Acknowledgment',
        statusBadge: {
          label: 'Verified',
          variant: 'emerald'
        },
        controlCode: a.documentCode,
        sha256Hash: a.verificationHash,
        metadata: {
          department: a.department,
          ipAddress: a.ipAddress,
          declarationAccepted: a.declarationAccepted
        }
      });
    });

    // E. Cryptographic Audit Trail Ledger Events
    const tenantAudit = tenantId ? auditTrail.filter(l => l.tenantId === tenantId || !l.tenantId) : auditTrail;
    tenantAudit.forEach(l => {
      let cat: 'evidence' | 'risk' | 'policy' | 'audit' = 'audit';
      const modLower = (l.module || '').toLowerCase();
      const descLower = (l.description || '').toLowerCase();

      if (modLower.includes('evidence') || descLower.includes('evidence')) {
        cat = 'evidence';
      } else if (modLower.includes('risk') || descLower.includes('risk')) {
        cat = 'risk';
      } else if (modLower.includes('polic') || descLower.includes('mou') || descLower.includes('soa')) {
        cat = 'policy';
      }

      const isVerifiedAction = l.action === 'APPROVE' || l.action === 'LOCK_BASELINE' || l.action === 'SIGN_MOU';
      const isDelete = l.action === 'DELETE';

      list.push({
        id: `aud-log-${l.id}`,
        category: cat,
        actionType: 'AUDIT_LOG',
        title: `${l.module}: ${l.action}`,
        description: l.description,
        actorName: l.actorName || 'Authorized User',
        actorRole: l.actorRole || 'Compliance Officer',
        timestamp: l.timestamp,
        relativeTime: getRelativeTime(l.timestamp),
        moduleId:
          cat === 'evidence'
            ? 'evidence_centre'
            : cat === 'risk'
            ? 'risk_management'
            : cat === 'policy'
            ? 'policies'
            : 'audit_trail',
        moduleName: l.module || 'Audit Ledger',
        statusBadge: {
          label: isVerifiedAction ? 'Verified' : isDelete ? 'High Risk' : 'Pending Review',
          variant: isVerifiedAction ? 'emerald' : isDelete ? 'rose' : 'amber'
        },
        sha256Hash: l.sha256Hash,
        metadata: {
          ipAddress: l.ipAddress,
          blockIndex: l.blockIndex,
          previousHash: l.previousHash
        }
      });
    });

    // Deduplicate by unique key and sort chronologically descending (newest first)
    const seen = new Set<string>();
    const deduplicated = list.filter(item => {
      const key = `${item.category}-${item.title}-${item.timestamp.slice(0, 19)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduplicated.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
  }, [currentTenant?.id, evidence, risks, generatedDocs, documentAcknowledgments, auditTrail, refreshTick]);

  // 2. Filter by Category, Status, and Search query
  const filteredActivities = useMemo(() => {
    return unifiedActivities.filter(act => {
      // Status filter
      if (statusFilter !== 'all' && act.statusBadge.label !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && act.category !== categoryFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(query);
        const matchesDesc = act.description.toLowerCase().includes(query);
        const matchesActor = act.actorName.toLowerCase().includes(query);
        const matchesControl = act.controlCode?.toLowerCase().includes(query);
        const matchesModule = act.moduleName.toLowerCase().includes(query);
        const matchesStatus = act.statusBadge.label.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesActor || matchesControl || matchesModule || matchesStatus;
      }

      return true;
    });
  }, [unifiedActivities, categoryFilter, statusFilter, searchQuery]);

  // Count summaries for filter tabs
  const categoryCounts = useMemo(() => {
    return {
      all: unifiedActivities.length,
      evidence: unifiedActivities.filter(a => a.category === 'evidence').length,
      risk: unifiedActivities.filter(a => a.category === 'risk').length,
      policy: unifiedActivities.filter(a => a.category === 'policy').length,
      audit: unifiedActivities.filter(a => a.category === 'audit').length
    };
  }, [unifiedActivities]);

  // Status count summaries for instant visibility
  const statusCounts = useMemo(() => {
    return {
      all: unifiedActivities.length,
      verified: unifiedActivities.filter(a => a.statusBadge.label === 'Verified').length,
      pending: unifiedActivities.filter(a => a.statusBadge.label === 'Pending Review').length
    };
  }, [unifiedActivities]);

  const displayedActivities = isExpanded
    ? filteredActivities
    : filteredActivities.slice(0, maxInitialDisplay);

  // Copy SHA-256 Hash to clipboard
  const handleCopyHash = (hash?: string) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export feed to CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Category',
      'Action Type',
      'Title',
      'Description',
      'Actor Name',
      'Actor Role',
      'Control Code',
      'Status',
      'SHA-256 Hash'
    ];

    const rows = filteredActivities.map(act => [
      `"${act.timestamp}"`,
      `"${act.category.toUpperCase()}"`,
      `"${act.actionType}"`,
      `"${act.title.replace(/"/g, '""')}"`,
      `"${act.description.replace(/"/g, '""')}"`,
      `"${act.actorName.replace(/"/g, '""')}"`,
      `"${act.actorRole.replace(/"/g, '""')}"`,
      `"${act.controlCode || 'N/A'}"`,
      `"${act.statusBadge.label}"`,
      `"${act.sha256Hash || 'N/A'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GRC_Recent_Activity_Feed_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Action: Simulate a live user action directly into the GRC feed
  const handleSimulateAction = async (type: 'evidence' | 'risk' | 'policy') => {
    setIsSimulatingAction(true);
    const nowIso = new Date().toISOString();

    try {
      if (type === 'evidence') {
        const title = `Production Kube-bench CIS Benchmark Scan #${Math.floor(1000 + Math.random() * 9000)}`;
        uploadEvidence({
          title,
          controlCode: 'A.8.8',
          department: 'Software Engineering & DevOps',
          fileName: `kube_bench_cis_report_${Date.now()}.json`,
          fileSize: '1.8 MB',
          fileType: 'application/json',
          tags: ['Kubernetes', 'CIS Benchmark', 'Automated', 'DevOps'],
          initialStatus: 'Pending Review'
        });
        await logAuditEvent(
          'CREATE',
          'Evidence Centre',
          `Uploaded and verified automated evidence: ${title} for ISO 27001 control A.8.8.`
        );
      } else if (type === 'risk') {
        const riskTitle = `Zero-Day Vulnerability in Cloud API Gateway #${Math.floor(100 + Math.random() * 900)}`;
        addRisk({
          title: riskTitle,
          category: 'Information Security',
          linkedItem: 'AWS API Gateway Production Cluster',
          department: 'Software Engineering & DevOps',
          threatDescription: 'Adversary probes unauthenticated edge proxies for request smuggling.',
          vulnerabilityDescription: 'Outdated reverse proxy headers configuration.',
          likelihood: 2,
          impact: 4,
          treatmentOption: 'Mitigate',
          mitigationControl: 'Deployed automated AWS WAF rule 2026-SEC-09 and rate-limiting perimeter.',
          treatmentOwner: currentUser.name || 'Security Lead',
          targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          residualLikelihood: 1,
          residualImpact: 2,
          status: 'Treatment in Progress'
        });
        await logAuditEvent(
          'CREATE',
          'Risk Register',
          `Conducted risk assessment for "${riskTitle}". Evaluated inherent score 8 -> residual 2.`
        );
      } else if (type === 'policy') {
        const docCode = `POL-AI-0${Math.floor(1 + Math.random() * 9)}`;
        await logAuditEvent(
          'APPROVE',
          'Policy Suite',
          `Approved and digitally signed policy amendment for ${docCode} (AI Ethics & Data Protection Standard v2.1).`
        );
      }
      setLastLoggedId(nowIso);
      setTimeout(() => setLastLoggedId(null), 3000);
    } catch (err) {
      console.error('Failed to log simulated user action:', err);
    } finally {
      setIsSimulatingAction(false);
      setIsQuickActionOpen(false);
    }
  };

  // Subtle, color-coded status badge configuration
  const getStatusBadgeConfig = (variant: RecentActivityItem['statusBadge']['variant']) => {
    if (theme === 'light') {
      switch (variant) {
        case 'emerald':
          return {
            container: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs',
            dot: 'bg-emerald-500',
            pulse: false
          };
        case 'amber':
          return {
            container: 'bg-amber-50 text-amber-900 border-amber-200 shadow-2xs',
            dot: 'bg-amber-500',
            pulse: true
          };
        case 'rose':
          return {
            container: 'bg-rose-50 text-rose-900 border-rose-200 shadow-2xs',
            dot: 'bg-rose-500',
            pulse: false
          };
        case 'indigo':
          return {
            container: 'bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
            dot: 'bg-indigo-500',
            pulse: false
          };
        case 'blue':
          return {
            container: 'bg-sky-50 text-sky-900 border-sky-200 shadow-2xs',
            dot: 'bg-sky-500',
            pulse: false
          };
        default:
          return {
            container: 'bg-slate-100 text-slate-800 border-slate-200 shadow-2xs',
            dot: 'bg-slate-400',
            pulse: false
          };
      }
    }

    // Dark mode
    switch (variant) {
      case 'emerald':
        return {
          container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          dot: 'bg-emerald-400',
          pulse: false
        };
      case 'amber':
        return {
          container: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          dot: 'bg-amber-400',
          pulse: true
        };
      case 'rose':
        return {
          container: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          dot: 'bg-rose-400',
          pulse: false
        };
      case 'indigo':
        return {
          container: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
          dot: 'bg-indigo-400',
          pulse: false
        };
      case 'blue':
        return {
          container: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
          dot: 'bg-sky-400',
          pulse: false
        };
      default:
        return {
          container: 'bg-slate-800/80 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          pulse: false
        };
    }
  };

  // Backward compatibility helper
  const getBadgeStyle = (variant: RecentActivityItem['statusBadge']['variant']) => {
    return getStatusBadgeConfig(variant).container;
  };

  // Category Icon & Color
  const getCategoryIcon = (category: RecentActivityItem['category']) => {
    switch (category) {
      case 'evidence':
        return <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'policy':
        return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'audit':
      default:
        return <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className={`p-4 sm:p-5 flex flex-col justify-between h-full space-y-4 ${className}`}>
      {/* 1. Header Toolbar */}
      {showHeaderControls && (
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b gap-3 ${
            theme === 'light' ? 'border-slate-200/90' : 'border-slate-800/70'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2.5">
              <div
                className={`p-1.5 rounded-lg border ${
                  theme === 'light'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <h3
                className={`text-sm font-bold tracking-tight flex items-center space-x-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>Recent Activity & Governance Actions</span>
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    theme === 'light'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-semibold'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Feed ({unifiedActivities.length})</span>
                </span>
              </h3>
            </div>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <p
                className={`text-xs ${
                  theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}
              >
                Chronological log of evidence deposits, risk evaluations, policy updates, and staff attestations
              </p>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Last updated:</span>
                <span
                  className={`font-semibold transition-colors ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                  }`}
                  title={`Full timestamp: ${lastUpdated.toLocaleString()}`}
                >
                  {lastUpdatedTimeFormatted}
                </span>
                <span className="text-[10px] text-slate-400">({relativeLastUpdated})</span>
                {justRefreshedNotice && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium animate-pulse">
                    • Refreshed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Auto-Refresh Toggle & Manual Refresh Button */}
            <div
              className={`flex items-center rounded-lg border p-0.5 relative transition-all shadow-2xs ${
                theme === 'light'
                  ? 'bg-white border-slate-300'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              {/* Manual Refresh Now */}
              <button
                onClick={triggerRefresh}
                disabled={isRefreshing}
                title={`Click to refresh feed now. Auto-refresh: ${
                  isAutoRefreshEnabled ? `Every ${autoRefreshInterval}s (next in ${countdown}s)` : 'Paused'
                }`}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition ${
                  theme === 'light'
                    ? 'hover:bg-slate-100 text-slate-700 disabled:opacity-50'
                    : 'hover:bg-slate-800 text-slate-200 disabled:opacity-50'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-sky-500 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Updating...' : 'Refresh'}
                </span>
              </button>

              {/* Divider */}
              <div
                className={`w-px h-4 my-auto ${
                  theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'
                }`}
              />

              {/* Auto-Refresh Status Pill & Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setIsIntervalMenuOpen(prev => !prev)}
                  title="Configure periodic auto-refresh interval"
                  className={`text-[11px] px-2 py-1 rounded-md font-mono flex items-center space-x-1 transition ${
                    theme === 'light'
                      ? 'hover:bg-slate-100 text-slate-600'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isAutoRefreshEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {isAutoRefreshEnabled ? `Auto: ${countdown}s` : 'Auto: Off'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isIntervalMenuOpen && (
                  <div
                    className={`absolute right-0 mt-1.5 w-52 rounded-xl border shadow-xl p-1.5 z-40 transition-all ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-slate-900 border-slate-800 text-slate-100'
                    }`}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Auto-Refresh Frequency
                    </div>
                    {[
                      { label: 'Every 30 seconds', sec: 30, tag: 'Rapid' },
                      { label: 'Every 60 seconds (Default)', sec: 60, tag: 'Standard' },
                      { label: 'Every 120 seconds', sec: 120, tag: 'Relaxed' },
                      { label: 'Pause Auto-Refresh', sec: 0, tag: 'Off' }
                    ].map(opt => {
                      const isSelected =
                        opt.sec === 0
                          ? !isAutoRefreshEnabled
                          : isAutoRefreshEnabled && autoRefreshInterval === opt.sec;
                      return (
                        <button
                          key={opt.sec}
                          onClick={() => handleSelectInterval(opt.sec)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                            isSelected
                              ? theme === 'light'
                                ? 'bg-sky-50 text-sky-800 font-semibold'
                                : 'bg-sky-500/10 text-sky-400 font-semibold'
                              : theme === 'light'
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isSelected ? (
                              <Check className="w-3 h-3 text-sky-500 shrink-0" />
                            ) : (
                              <div className="w-3 h-3 shrink-0" />
                            )}
                            <span>{opt.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{opt.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Log Action Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionOpen(prev => !prev)}
                disabled={isSimulatingAction}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-sky-500" />
                <span>{isSimulatingAction ? 'Logging...' : 'Log Action'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isQuickActionOpen && (
                <div
                  className={`absolute right-0 mt-1.5 w-60 rounded-xl border shadow-xl p-2 z-30 transition-all ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                >
                  <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Significant Action
                  </div>
                  <button
                    onClick={() => handleSimulateAction('evidence')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center space-x-2 transition ${
                      theme === 'light' ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Upload & Sign Evidence</span>
                  </button>
                  <button
                    onClick={() => handleSimulateAction('risk')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center space-x-2 transition ${
                      theme === 'light' ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Conduct Risk Assessment</span>
                  </button>
                  <button
                    onClick={() => handleSimulateAction('policy')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center space-x-2 transition ${
                      theme === 'light' ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Approve & Sign Policy</span>
                  </button>
                </div>
              )}
            </div>

            {/* Export Feed */}
            <button
              onClick={handleExportCSV}
              title="Export filtered activity log as CSV"
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Full Audit Trail Link */}
            <button
              onClick={() => onNavigateModule('audit_trail')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition ${
                theme === 'light'
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20'
              }`}
            >
              <span>Ledger Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 ${
              categoryFilter === 'all'
                ? theme === 'light'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-sky-700 text-white border-sky-700'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>All Actions</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'all'
                  ? 'bg-black/25 text-white'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categoryCounts.all}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter('evidence')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1.5 ${
              categoryFilter === 'evidence'
                ? theme === 'light'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-emerald-600 text-white border-emerald-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3 h-3 text-emerald-500" />
            <span>Evidence Uploads</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'evidence'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categoryCounts.evidence}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter('risk')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1.5 ${
              categoryFilter === 'risk'
                ? theme === 'light'
                  ? 'bg-amber-800 text-white border-amber-800'
                  : 'bg-amber-600 text-white border-amber-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Risk Assessments</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'risk'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categoryCounts.risk}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter('policy')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1.5 ${
              categoryFilter === 'policy'
                ? theme === 'light'
                  ? 'bg-indigo-800 text-white border-indigo-800'
                  : 'bg-indigo-600 text-white border-indigo-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3 h-3 text-indigo-500" />
            <span>Policy Updates</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'policy'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categoryCounts.policy}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter('audit')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1.5 ${
              categoryFilter === 'audit'
                ? theme === 'light'
                  ? 'bg-sky-800 text-white border-sky-800'
                  : 'bg-sky-600 text-white border-sky-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-sky-500" />
            <span>Ledger & Security</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'audit'
                  ? 'bg-white/20 text-white'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {categoryCounts.audit}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search recent actions..."
            className={`w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border transition outline-none ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                : 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2b. Status Visibility Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Filter by Status:</span>
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                statusFilter === 'all'
                  ? theme === 'light'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-200 text-slate-900 border-slate-200'
                  : theme === 'light'
                  ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              All Statuses ({statusCounts.all})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'Verified' ? 'all' : 'Verified')}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all inline-flex items-center space-x-1.5 ${
                statusFilter === 'Verified'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : theme === 'light'
                  ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusFilter === 'Verified' ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Verified ({statusCounts.verified})</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'Pending Review' ? 'all' : 'Pending Review')}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all inline-flex items-center space-x-1.5 ${
                statusFilter === 'Pending Review'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : theme === 'light'
                  ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/60'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusFilter === 'Pending Review' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />
              <span>Pending Review ({statusCounts.pending})</span>
            </button>
          </div>
        </div>

        {/* Status bar auto-refresh & last updated indicator */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 shrink-0 self-end sm:self-center">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Updated {relativeLastUpdated}</span>
          {isAutoRefreshEnabled ? (
            <span
              className={`inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                theme === 'light'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              }`}
              title={`Periodic auto-refresh active (every ${autoRefreshInterval}s)`}
            >
              <span className="w-1 h-1 rounded-full bg-sky-500 animate-ping" />
              <span>{countdown}s</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-sans">(Paused)</span>
          )}
        </div>
      </div>

      {/* 3. Chronological Activities Feed List */}
      {displayedActivities.length === 0 ? (
        <div
          className={`p-8 text-center rounded-xl border ${
            theme === 'light' ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/40 border-slate-800'
          }`}
        >
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p
            className={`text-sm font-semibold ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            No activity matches the selected filter
          </p>
          <p
            className={`text-xs mt-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Try selecting "All Actions" or clear your search keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedActivities.map((act, index) => {
            const isJustAdded = lastLoggedId && index === 0;

            return (
              <div
                key={act.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isJustAdded ? 'ring-2 ring-emerald-500/50 animate-pulse' : ''
                } ${
                  theme === 'light'
                    ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                    : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Icon, Category & Core Details */}
                <div className="flex items-start space-x-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {getCategoryIcon(act.category)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      {(() => {
                        const badgeConfig = getStatusBadgeConfig(act.statusBadge.variant);
                        return (
                          <span
                            className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${badgeConfig.container}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeConfig.dot} ${
                                badgeConfig.pulse ? 'animate-pulse' : ''
                              }`}
                            />
                            <span className="tracking-tight whitespace-nowrap">
                              {act.statusBadge.label}
                            </span>
                          </span>
                        );
                      })()}

                      {act.controlCode && (
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            theme === 'light'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          {act.controlCode}
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-mono flex items-center space-x-1 ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                        }`}
                        title={new Date(act.timestamp).toLocaleString()}
                      >
                        <Clock className="w-3 h-3 inline text-slate-400" />
                        <span>{act.relativeTime}</span>
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold tracking-tight truncate group-hover:text-sky-600 transition ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {act.title}
                    </h4>

                    <p
                      className={`text-xs leading-relaxed line-clamp-1 ${
                        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {act.description}
                    </p>

                    {/* Actor & Module attribution */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                      <span
                        className={`flex items-center space-x-1 font-medium ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {act.actorName}
                        </span>
                        <span className="text-[10px] text-slate-400">({act.actorRole})</span>
                      </span>

                      {act.sha256Hash && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCopyHash(act.sha256Hash);
                          }}
                          className={`flex items-center space-x-1 font-mono text-[10px] px-1.5 py-0.5 rounded border transition ${
                            copiedHash === act.sha256Hash
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : theme === 'light'
                              ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                          title="Click to copy SHA-256 integrity hash"
                        >
                          <Hash className="w-2.5 h-2.5 text-slate-400" />
                          <span>{act.sha256Hash.slice(0, 8)}...</span>
                          {copiedHash === act.sha256Hash ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Inspect & Navigate Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/60 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedActivity(act)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition flex items-center space-x-1 ${
                      theme === 'light'
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => onNavigateModule(act.moduleId)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition flex items-center space-x-1.5 ${
                      theme === 'light'
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
                        : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20'
                    }`}
                  >
                    <span>{act.moduleName}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Expand / Show More Footer */}
      {filteredActivities.length > maxInitialDisplay && (
        <div
          className={`pt-2 flex items-center justify-between border-t ${
            theme === 'light' ? 'border-slate-200/80' : 'border-slate-800/80'
          }`}
        >
          <span
            className={`text-xs font-mono ${
              theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
            }`}
          >
            Showing {displayedActivities.length} of {filteredActivities.length} chronological actions
          </span>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <span>{isExpanded ? 'Collapse Activity Stream' : 'View All Recent Actions'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      {/* 5. Detailed Activity Event Dossier Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {getCategoryIcon(selectedActivity.category)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <h3 className="text-sm font-bold">{selectedActivity.title}</h3>
                    {(() => {
                      const badgeConfig = getStatusBadgeConfig(selectedActivity.statusBadge.variant);
                      return (
                        <span
                          className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeConfig.container}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeConfig.dot} ${
                              badgeConfig.pulse ? 'animate-pulse' : ''
                            }`}
                          />
                          <span>{selectedActivity.statusBadge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-400">
                    Chronological Ledger Event: {selectedActivity.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Action Description
                </span>
                <p
                  className={`mt-1 p-2.5 rounded-lg border leading-relaxed ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {selectedActivity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Actor</span>
                  <span className="font-semibold block mt-0.5">{selectedActivity.actorName}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedActivity.actorRole}</span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                  <span className="font-semibold block mt-0.5">{selectedActivity.relativeTime}</span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate">
                    {new Date(selectedActivity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedActivity.sha256Hash && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Cryptographic SHA-256 Digest
                    </span>
                    <button
                      onClick={() => handleCopyHash(selectedActivity.sha256Hash)}
                      className="text-[11px] text-sky-500 hover:text-sky-600 font-semibold flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedHash === selectedActivity.sha256Hash ? 'Copied!' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div
                    className={`mt-1 p-2 rounded-lg border font-mono text-[11px] break-all ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-emerald-400'
                    }`}
                  >
                    {selectedActivity.sha256Hash}
                  </div>
                </div>
              )}

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Event Context Payload
                  </span>
                  <pre
                    className={`mt-1 p-2 rounded-lg border font-mono text-[10px] overflow-x-auto ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {JSON.stringify(selectedActivity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span
                className={`text-[11px] font-mono ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Module Target: {selectedActivity.moduleName}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    theme === 'light' ? 'border-slate-300 hover:bg-slate-100' : 'border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = selectedActivity.moduleId;
                    setSelectedActivity(null);
                    onNavigateModule(target);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center space-x-1"
                >
                  <span>Open in {selectedActivity.moduleName}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
