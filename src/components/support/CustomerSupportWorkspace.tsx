import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookOpen,
  Server,
  Activity,
  UserCheck,
  Building2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Lock,
  Send,
  Eye,
  FileText,
  HelpCircle,
  Database,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  serviceManagementService
} from '../../services/support/serviceManagementService';
import {
  EnterpriseSupportCase,
  SupportCaseLifecycle,
  CaseType,
  SupportPriority,
  SupportQueueId,
  ServiceCatalogItem,
  KnowledgeArticle,
  ProblemRecord
} from '../../types/serviceManagementTypes';

interface CustomerSupportWorkspaceProps {
  initialTab?: string;
  initialCaseId?: string;
}

export const CustomerSupportWorkspace: React.FC<CustomerSupportWorkspaceProps> = ({
  initialTab = 'inbox',
  initialCaseId
}) => {
  const { currentTenant, currentRole, currentUser } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [cases, setCases] = useState<EnterpriseSupportCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<EnterpriseSupportCase | null>(null);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeArticle[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<string>('ALL');

  // Interactive Comments & Modals
  const [newCommentBody, setNewCommentBody] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);

  // New Case Form State
  const [newCaseSubject, setNewCaseSubject] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const [newCaseType, setNewCaseType] = useState<CaseType>('INCIDENT');
  const [newCaseServiceId, setNewCaseServiceId] = useState('SRV-GRC-CORE');

  // AI Copilot Output State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiDraftReply, setAiDraftReply] = useState<string | null>(null);

  const isPlatformAdmin = currentRole === 'SUPER_ADMIN';
  const effectiveRole = isPlatformAdmin ? 'SKANDA_PLATFORM_ADMIN' : 'TENANT_ADMIN';
  const tid = currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE';

  const refreshData = () => {
    const list = serviceManagementService.listCases(
      {
        priority: selectedPriorityFilter !== 'ALL' ? (selectedPriorityFilter as SupportPriority) : undefined,
        queue: selectedQueueFilter !== 'ALL' ? (selectedQueueFilter as SupportQueueId) : undefined,
        search: searchQuery
      },
      effectiveRole,
      tid
    );
    setCases(list);

    const catalog = serviceManagementService.getServiceCatalog();
    setServices(catalog);

    const kb = serviceManagementService.searchKnowledge();
    setKnowledgeList(kb);

    const prbs = serviceManagementService.listProblems(effectiveRole, tid);
    setProblems(prbs);

    if (initialCaseId) {
      const found = list.find(c => c.id === initialCaseId);
      if (found) setSelectedCase(found);
    } else if (list.length > 0 && !selectedCase) {
      setSelectedCase(list[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [tid, currentRole, selectedPriorityFilter, selectedQueueFilter, searchQuery]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = serviceManagementService.createCase(
        tid,
        currentTenant?.name || 'Acme Financial Technologies',
        newCaseType,
        newCaseSubject,
        newCaseDescription,
        currentUser?.email || 'admin@acmefintech.io',
        currentUser?.name || 'David Tan',
        {
          affectedServiceId: newCaseServiceId,
          customerTier: 'ENTERPRISE'
        }
      );
      showToast({
        title: 'Support Case Created',
        message: `Case ${created.caseNumber} initiated. Priority: ${created.priority}. SLA clock active.`,
        type: 'success'
      });
      setIsCreateCaseOpen(false);
      setNewCaseSubject('');
      setNewCaseDescription('');
      refreshData();
      setSelectedCase(created);
    } catch (err) {
      showToast({
        title: 'Case Creation Failed',
        message: String(err),
        type: 'error'
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newCommentBody.trim()) return;

    const res = serviceManagementService.addComment(
      selectedCase.id,
      newCommentBody,
      isInternalComment,
      {
        email: currentUser?.email || 'admin@acmefintech.io',
        name: currentUser?.name || 'David Tan',
        role: currentRole || 'TENANT_ADMIN'
      }
    );

    if (res.success) {
      showToast({
        title: 'Comment Added',
        message: isInternalComment ? 'Internal engineering note recorded.' : 'Customer reply posted.',
        type: 'info'
      });
      setNewCommentBody('');
      const updated = serviceManagementService.getCase(selectedCase.id, effectiveRole, tid);
      setSelectedCase(updated);
      refreshData();
    }
  };

  const handleResolveCase = () => {
    if (!selectedCase) return;
    const res = serviceManagementService.resolveCase(
      selectedCase.id,
      'OAuth bearer token rotation verified. Telemetry sync restored with zero residual drift.',
      'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      {
        email: currentUser?.email || 'marcus.vance@skanda.support',
        name: 'Marcus Vance',
        role: 'SKANDA_PLATFORM_ADMIN'
      }
    );
    if (res.success) {
      showToast({
        title: 'Case Resolved',
        message: 'Resolution recorded. Customer confirmation window opened.',
        type: 'success'
      });
      refreshData();
      setSelectedCase(serviceManagementService.getCase(selectedCase.id, effectiveRole, tid));
    }
  };

  const handleConfirmResolution = (action: 'CONFIRM' | 'REOPEN') => {
    if (!selectedCase) return;
    const res = serviceManagementService.confirmResolution(
      selectedCase.id,
      action,
      {
        email: currentUser?.email || 'ciso@acmefintech.io',
        name: 'David Tan',
        role: 'TENANT_ADMIN'
      },
      action === 'CONFIRM' ? 'Verified directory sync is functioning normally.' : 'Connector timeout occurred again.',
      5
    );
    if (res.success) {
      showToast({
        title: action === 'CONFIRM' ? 'Resolution Confirmed' : 'Case Reopened',
        message: action === 'CONFIRM' ? 'Case closed. Customer satisfaction rating 5/5 recorded.' : 'Case reopened for further investigation.',
        type: action === 'CONFIRM' ? 'success' : 'warning'
      });
      refreshData();
      setSelectedCase(serviceManagementService.getCase(selectedCase.id, effectiveRole, tid));
    }
  };

  const handleTriggerRetest = (controlId: string) => {
    if (!selectedCase) return;
    const res = serviceManagementService.triggerControlRetest(
      selectedCase.id,
      controlId,
      {
        email: currentUser?.email || 'ciso@acmefintech.io',
        name: 'David Tan',
        role: 'TENANT_ADMIN'
      }
    );
    showToast({
      title: 'Control Retest Passed',
      message: `Control ${res.controlId} verified 100% effective. Hash: ${res.verificationHash.slice(0, 12)}...`,
      type: 'success'
    });
    refreshData();
    setSelectedCase(serviceManagementService.getCase(selectedCase.id, effectiveRole, tid));
  };

  const handleRunAiAnalysis = () => {
    if (!selectedCase) return;
    const summaryRes = serviceManagementService.aiSummarizeCase(selectedCase.id);
    const draftRes = serviceManagementService.aiDraftCustomerReply(selectedCase.id);
    setAiSummary(summaryRes.summary);
    setAiDraftReply(draftRes.draftBody);
    showToast({
      title: 'AI Copilot Analysis Ready',
      message: 'Generated case summary and drafted response for human review.',
      type: 'info'
    });
  };

  const p1Count = cases.filter(c => c.priority === 'P1' && c.lifecycle !== 'CLOSED').length;
  const activeCount = cases.filter(c => c.lifecycle !== 'CLOSED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* 1. Header Banner & Executive KPIs */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Enterprise Service Management & SLA Operations
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SLA 99.99%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecting Customer Support, Continuous Telemetry, Control Assurance, SLA Clocks & Root Cause Intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateCaseOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Support Case</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Open Cases</div>
            <div className="text-2xl font-black text-white mt-1">{activeCount}</div>
            <div className="text-[11px] font-mono text-blue-400 mt-0.5">Tenant: {currentTenant?.name || 'Acme FinTech'}</div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical P1 Incidents</div>
            <div className={`text-2xl font-black mt-1 ${p1Count > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {p1Count}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">15m Mission-Critical SLA</div>
          </div>
          <div className={`p-3 rounded-xl ${p1Count > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Compliance</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">98.8%</div>
            <div className="text-[11px] font-mono text-emerald-500 mt-0.5">First Response Met</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Health</div>
            <div className="text-2xl font-black text-amber-400 mt-1">DEGRADED</div>
            <div className="text-[11px] font-mono text-amber-400 mt-0.5">1 Connector sync issue</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'inbox', label: `Support Queue (${cases.length})`, icon: LifeBuoy },
          { id: 'case_detail', label: 'Case 360 & Investigation', icon: Layers },
          { id: 'incidents', label: 'Incident Command Room', icon: ShieldAlert },
          { id: 'sla_monitor', label: 'SLA Observability', icon: Clock },
          { id: 'knowledge', label: `Knowledge Base (${knowledgeList.length})`, icon: BookOpen },
          { id: 'service_health', label: 'Service Catalog & Topology', icon: Server },
          { id: 'problems', label: `Problem Desk (${problems.length})`, icon: HelpCircle },
          { id: 'ai_copilot', label: 'AI Support Copilot', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab 1: Support Queue & Search */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases by number, subject, or customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={selectedPriorityFilter}
                onChange={e => setSelectedPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300"
              >
                <option value="ALL">All Priorities</option>
                <option value="P1">P1 — Critical</option>
                <option value="P2">P2 — High</option>
                <option value="P3">P3 — Medium</option>
                <option value="P4">P4 — Low</option>
              </select>

              <select
                value={selectedQueueFilter}
                onChange={e => setSelectedQueueFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300"
              >
                <option value="ALL">All Queues</option>
                <option value="INTEGRATIONS">Integrations</option>
                <option value="SECURITY">Security</option>
                <option value="PRIVACY">Privacy</option>
                <option value="GRC">GRC Support</option>
                <option value="BILLING">Billing</option>
                <option value="TECHNICAL_SUPPORT">Tech Support</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 font-bold text-sm flex items-center justify-between">
              <span>Active Case Registry ({cases.length})</span>
              <span className="text-xs font-mono text-slate-400">Strict Multi-Tenant Isolation Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-700 uppercase font-mono">
                    <th className="p-3.5">Case #</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Queue</th>
                    <th className="p-3.5">Resolution SLA</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {cases.map(c => {
                    const isP1 = c.priority === 'P1';
                    return (
                      <tr key={c.id} className="hover:bg-slate-750/50 transition">
                        <td className="p-3.5 font-mono font-bold text-blue-400">{c.caseNumber}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isP1
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : c.priority === 'P2'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-300">{c.type.replace('_', ' ')}</td>
                        <td className="p-3.5 max-w-xs truncate font-medium text-white">{c.subject}</td>
                        <td className="p-3.5 font-mono text-slate-400">{c.queue}</td>
                        <td className="p-3.5 font-mono">
                          <span className={`${c.resolutionSla.isBreached ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                            {c.resolutionSla.remainingMinutes}m rem.
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                            {c.lifecycle}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedCase(c);
                              setActiveTab('case_detail');
                            }}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition font-bold cursor-pointer"
                          >
                            Open 360 →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Case 360 & Investigation Split-Screen */}
      {activeTab === 'case_detail' && selectedCase && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Case Anatomy, SLAs & GRC Linchpins (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-mono text-blue-400 font-bold">{selectedCase.caseNumber}</span>
                  <h3 className="text-lg font-black text-white">{selectedCase.subject}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  selectedCase.priority === 'P1'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}>
                  {selectedCase.priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Organization:</span>
                  <div className="font-bold text-slate-200">{selectedCase.organizationName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Customer Tier:</span>
                  <div className="font-bold text-blue-400">{selectedCase.customerTier}</div>
                </div>
                <div>
                  <span className="text-slate-400">Assigned Queue:</span>
                  <div className="font-mono text-slate-300">{selectedCase.queue}</div>
                </div>
                <div>
                  <span className="text-slate-400">Assigned Lead:</span>
                  <div className="font-bold text-slate-200">{selectedCase.assignedAgentName || 'Auto-Triage'}</div>
                </div>
              </div>

              {/* SLA Clocks */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">First Response SLA:</span>
                  <span className="text-emerald-400 font-bold">15m target (MET in 8m)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Resolution SLA:</span>
                  <span className={`${selectedCase.resolutionSla.isBreached ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>
                    {selectedCase.resolutionSla.remainingMinutes}m remaining ({selectedCase.resolutionSla.status})
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Description:</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-700/60">
                  {selectedCase.description}
                </p>
              </div>

              {/* GRC Linchpins */}
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked GRC Assurance Artifacts:</span>
                <div className="space-y-1.5 text-xs font-mono">
                  {selectedCase.relatedControlIds.map(ctrl => (
                    <div key={ctrl} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="text-blue-400 font-bold">{ctrl}</span>
                      <button
                        onClick={() => handleTriggerRetest(ctrl)}
                        className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                      >
                        Retest Control ↻
                      </button>
                    </div>
                  ))}
                  {selectedCase.relatedRiskIds.map(rsk => (
                    <div key={rsk} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-400">
                      Linked Risk: {rsk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Actions Bar */}
              <div className="pt-3 border-t border-slate-700 flex flex-wrap gap-2">
                {selectedCase.lifecycle !== 'RESOLVED' && selectedCase.lifecycle !== 'CLOSED' && (
                  <button
                    onClick={handleResolveCase}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer"
                  >
                    Resolve Case ✓
                  </button>
                )}

                {selectedCase.lifecycle === 'RESOLVED' && (
                  <div className="w-full p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-emerald-400">
                      Case is marked RESOLVED. Awaiting Customer Confirmation:
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfirmResolution('CONFIRM')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        Confirm Resolution ✓
                      </button>
                      <button
                        onClick={() => handleConfirmResolution('REOPEN')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        Dispute & Reopen ↻
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Communication Timeline & Comments (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Communication History & Audit Trail ({selectedCase.comments.length})</span>
                </h4>
                <button
                  onClick={handleRunAiAnalysis}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Copilot</span>
                </button>
              </div>

              {/* AI Copilot Panel */}
              {aiSummary && (
                <div className="mb-4 p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Copilot Diagnostic Synthesis (Human Oversight Required):</span>
                  </div>
                  <p className="text-slate-300">{aiSummary}</p>
                  {aiDraftReply && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 font-mono text-[11px] text-slate-300">
                      <strong>Suggested Customer Reply:</strong>
                      <p className="mt-1 whitespace-pre-wrap">{aiDraftReply}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Timeline */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[420px] pr-2">
                {selectedCase.comments.map(cmt => (
                  <div
                    key={cmt.id}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      cmt.isInternalOnly
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900 border-slate-700/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{cmt.actorName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({cmt.actorRole})</span>
                        {cmt.isInternalOnly && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            INTERNAL NOTE
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(cmt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{cmt.body}</p>
                  </div>
                ))}
              </div>

              {/* New Comment Input */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-700 space-y-3 mt-4">
                <textarea
                  rows={3}
                  placeholder="Type a message or update..."
                  value={newCommentBody}
                  onChange={e => setNewCommentBody(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                />

                <div className="flex items-center justify-between">
                  {isPlatformAdmin ? (
                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={e => setIsInternalComment(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600"
                      />
                      <span>Mark as Internal Note (Hidden from Customer)</span>
                    </label>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Public Customer Communication</span>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Incident Command Room */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>Major Incident & Post-Incident Review (PIR) Command Centre</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time containment, root cause analysis (RCA), and executive assurance sign-off.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.filter(c => c.priority === 'P1').map(inc => (
                <div key={inc.id} className="p-5 bg-slate-900 rounded-2xl border border-rose-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      CRITICAL P1 INCIDENT
                    </span>
                    <span className="font-mono text-xs text-slate-400">{inc.caseNumber}</span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{inc.subject}</h4>
                  <p className="text-xs text-slate-300">{inc.description}</p>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div>Commander: <span className="text-blue-400">{inc.incidentCommanderEmail || 'srikarthik@skanda.security'}</span></div>
                    <div>Affected Service: <span className="text-amber-400">{inc.affectedServiceCode}</span></div>
                    <div>Impacted Users: <span className="text-white">{inc.affectedUserCount} users</span></div>
                  </div>

                  <div className="pt-2 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCase(inc);
                        setActiveTab('case_detail');
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Enter Incident Room →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: SLA Observability */}
      {activeTab === 'sla_monitor' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Contractual SLA Performance & Health Observability</h3>
            <p className="text-xs text-slate-400">
              Deterministic SLA timers calculating first response, resolution, and warning thresholds based on customer tier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">First Response SLA</div>
                <div className="text-3xl font-black text-emerald-400">98.4%</div>
                <div className="text-xs text-slate-400">Average response time: 8.2 mins (P1 target: 15 mins)</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Resolution SLA</div>
                <div className="text-3xl font-black text-emerald-400">96.2%</div>
                <div className="text-xs text-slate-400">Average resolution: 42 mins for P1s</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Customer CSAT</div>
                <div className="text-3xl font-black text-amber-400">4.85 / 5.0</div>
                <div className="text-xs text-slate-400">Based on verified customer confirmations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Tab 5: Knowledge Base Studio */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Authoritative Knowledge Base & Remediation Guides</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Peer-reviewed technical troubleshooting, regulatory guidance, and statutory control implementations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeList.map(kb => (
                <div key={kb.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                      {kb.type}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{kb.articleNumber}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{kb.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{kb.summary}</p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>Author: {kb.authorEmail}</div>
                    <div>Controls: {kb.relatedControlIds.join(', ')}</div>
                    <div>Status: <span className="text-emerald-400 font-bold">{kb.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. Tab 6: Service Catalog & Health Matrix */}
      {activeTab === 'service_health' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Sovereign Service Catalog & Topology</h3>
            <p className="text-xs text-slate-400">
              Live status, dependency maps, and criticality classification across SKANDA services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {services.map(srv => {
                const isDegraded = srv.healthStatus !== 'OPERATIONAL';
                return (
                  <div key={srv.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-400">{srv.serviceCode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isDegraded ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {srv.healthStatus}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                    <p className="text-xs text-slate-300">{srv.description}</p>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                      <div>Criticality: <span className="text-white font-bold">{srv.criticality}</span></div>
                      <div>Default SLA: {srv.defaultSlaHours}h</div>
                      <div>Dependencies: {srv.dependencies.join(', ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 10. Tab 7: Problem Management */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Problem Management & Recurring Root Causes</h3>
            <p className="text-xs text-slate-400">
              Clustering recurring incidents into authoritative problem records and linking permanent fixes to CAPA.
            </p>

            <div className="space-y-4">
              {problems.map(prb => (
                <div key={prb.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{prb.problemNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {prb.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{prb.title}</h4>
                  <p className="text-xs text-slate-300">{prb.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 font-bold">Root Cause Analysis:</span>
                      <p className="text-slate-300 mt-0.5">{prb.rootCauseAnalysis}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Permanent Fix / CAPA:</span>
                      <p className="text-slate-300 mt-0.5">{prb.permanentFix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. Tab 8: AI Support Copilot */}
      {activeTab === 'ai_copilot' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-lg">
              <Sparkles className="w-5 h-5" />
              <span>SKANDA AI Support Copilot & Diagnostic Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI Support Copilot analyzes telemetry patterns, assists in root cause discovery, and drafts technical replies. In accordance with SKANDA AI Governance, AI cannot close cases, modify SLAs, or accept risk autonomously.
            </p>

            <div className="p-5 bg-slate-900 rounded-2xl border border-indigo-500/30 space-y-4">
              <h4 className="font-bold text-sm text-white">Select a case to trigger automated copilot diagnostics:</h4>
              <div className="flex flex-wrap gap-2">
                {cases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      handleRunAiAnalysis();
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                      selectedCase?.id === c.id
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {c.caseNumber} ({c.priority})
                  </button>
                ))}
              </div>

              {aiSummary && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-indigo-300">Diagnostic Summary:</div>
                  <p className="text-slate-200">{aiSummary}</p>
                  {aiDraftReply && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap mt-2">
                      {aiDraftReply}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 12. Create Case Modal */}
      {isCreateCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 bg-slate-900 border border-slate-700 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Create Enterprise Support Case</h3>
              <button
                onClick={() => setIsCreateCaseOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Case Type</label>
                <select
                  value={newCaseType}
                  onChange={e => setNewCaseType(e.target.value as CaseType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  <option value="INCIDENT">Incident / Outage</option>
                  <option value="INTEGRATION_FAILURE">Integration / Connector Failure</option>
                  <option value="SECURITY_INCIDENT">Security Incident</option>
                  <option value="PRIVACY_REQUEST">Privacy / DSAR Request</option>
                  <option value="COMPLIANCE_SUPPORT">Compliance / Audit Guidance</option>
                  <option value="SERVICE_REQUEST">Service Request</option>
                  <option value="BILLING_QUERY">Billing / Contract Query</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Affected Service</label>
                <select
                  value={newCaseServiceId}
                  onChange={e => setNewCaseServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.criticality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={newCaseSubject}
                  onChange={e => setNewCaseSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Evidence</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed description of the issue..."
                  value={newCaseDescription}
                  onChange={e => setNewCaseDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCaseOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-lg"
                >
                  Submit Case →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
