import React, { useState } from 'react';
import {
  DPDPDpiaComment,
  DPDPDpiaCommentType,
  DPDPDpiaCommentStatus,
  buildDpiaCommentProofHash
} from '../../data/dpdpMasterData';
import { useToast } from '../common/ToastContainer';
import {
  MessageSquare,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  User,
  Building,
  Hash,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';

interface DPDPDpiaCommentSectionProps {
  dpiaId: string;
  assessmentCode: string;
  assessmentTitle: string;
  comments: DPDPDpiaComment[];
  onAddComment: (comment: DPDPDpiaComment) => void;
  onUpdateCommentStatus: (
    commentId: string,
    newStatus: DPDPDpiaCommentStatus,
    resolutionNote?: string,
    resolvedBy?: string
  ) => void;
}

const PRESET_DEPARTMENT_HEADS = [
  {
    name: 'Vikramaditya Malhotra',
    role: 'Head of InfoSec & SecOps',
    department: 'Information Security & SecOps'
  },
  {
    name: 'Dr. Rajeshwar Rao',
    role: 'Head of Legal & Regulatory Affairs',
    department: 'Legal & Regulatory Affairs'
  },
  {
    name: 'Amit Sengupta',
    role: 'Lead Cloud Infrastructure Architect',
    department: 'DevOps & Cloud Engineering'
  },
  {
    name: 'Priya Sundaram',
    role: 'Head of Customer Experience & Operations',
    department: 'Customer Operations'
  },
  {
    name: 'Elena Rostova',
    role: 'Chief Data Protection Officer',
    department: 'Executive Compliance & DPO Office'
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Head of Product Management',
    department: 'Product Strategy'
  },
  {
    name: 'CA Harish Vardhan',
    role: 'Independent Data Auditor (Empanelled)',
    department: 'External Audit & Assurance'
  }
];

export const DPDPDpiaCommentSection: React.FC<DPDPDpiaCommentSectionProps> = ({
  dpiaId,
  assessmentCode,
  comments,
  onAddComment,
  onUpdateCommentStatus
}) => {
  const { showToast } = useToast();

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New comment composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customAuthor, setCustomAuthor] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [commentType, setCommentType] = useState<DPDPDpiaCommentType>('RISK_OBJECTION');
  const [statutoryClause, setStatutoryClause] = useState('Section 10(2)(c) DPIA Mandate');
  const [content, setContent] = useState('');

  // Resolve dialog state
  const [resolvingCommentId, setResolvingCommentId] = useState<string | null>(null);
  const [resolutionTargetStatus, setResolutionTargetStatus] = useState<DPDPDpiaCommentStatus>('ACCEPTED_INTO_DPIA');
  const [resolutionText, setResolutionText] = useState('');
  const [resolverName, setResolverName] = useState('Elena Rostova (Chief DPO)');

  // Filtered comments
  const filteredComments = comments.filter(c => {
    if (typeFilter !== 'ALL' && c.commentType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  // Handle Form Submit
  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let authorName = PRESET_DEPARTMENT_HEADS[selectedPresetIdx].name;
    let authorRole = PRESET_DEPARTMENT_HEADS[selectedPresetIdx].role;
    let department = PRESET_DEPARTMENT_HEADS[selectedPresetIdx].department;

    if (selectedPresetIdx === -1) {
      if (!customAuthor.trim()) return;
      authorName = customAuthor.trim();
      authorRole = customRole.trim() || 'Department Representative';
      department = customDept.trim() || 'General Operations';
    }

    const timestamp = new Date().toISOString();
    const hash = buildDpiaCommentProofHash(dpiaId, authorName, department, content.trim(), timestamp);

    const newComment: DPDPDpiaComment = {
      id: `cmnt_${Date.now()}`,
      dpiaId,
      authorName,
      authorRole,
      department,
      timestamp,
      commentType,
      content: content.trim(),
      statutoryClauseRef: statutoryClause.trim() || undefined,
      status: commentType === 'DEPARTMENT_SIGN_OFF' ? 'ACCEPTED_INTO_DPIA' : 'OPEN',
      auditEvidenceHash: hash
    };

    onAddComment(newComment);
    setContent('');
    setIsComposerOpen(false);

    showToast({
      title: 'Audit-Trailed Note Committed',
      description: `Logged ${commentType.replace(/_/g, ' ')} with cryptographic seal ${hash.slice(0, 18)}...`,
      type: 'success'
    });
  };

  // Handle resolution submit
  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingCommentId) return;

    onUpdateCommentStatus(
      resolvingCommentId,
      resolutionTargetStatus,
      resolutionText.trim() || 'Safeguard confirmed incorporated into DPIA technical mitigation plan.',
      resolverName.trim()
    );

    showToast({
      title: 'DPIA Note Status Updated',
      description: `Marked comment as ${resolutionTargetStatus.replace(/_/g, ' ')}.`,
      type: 'success'
    });

    setResolvingCommentId(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Departmental Collaboration & Audit-Trailed Notes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                {comments.length} Logged
              </span>
            </h5>
            <p className="text-[11px] text-slate-400">
              Cross-functional review by InfoSec, Legal, DevOps, Operations, and DPO under Section 10(2)(c).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsComposerOpen(!isComposerOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
            isComposerOpen
              ? 'bg-slate-800 text-slate-300'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isComposerOpen ? 'Close Note Composer' : 'Leave Department Note'}</span>
        </button>
      </div>

      {/* COMPOSER FORM */}
      {isComposerOpen && (
        <form
          onSubmit={handleCreateComment}
          className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3.5 shadow-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Record Cryptographically Signed Department Note</span>
            </span>
            <span className="text-[10px] font-mono text-purple-400">SHA-256 Non-Repudiation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Author Preset Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Signing Department Head / Reviewer:
              </label>
              <select
                value={selectedPresetIdx}
                onChange={e => setSelectedPresetIdx(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-purple-500"
              >
                {PRESET_DEPARTMENT_HEADS.map((h, idx) => (
                  <option key={idx} value={idx}>
                    {h.name} — {h.role} ({h.department})
                  </option>
                ))}
                <option value={-1}>+ Custom Department Reviewer...</option>
              </select>
            </div>

            {/* Note Type */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Note Category:
              </label>
              <select
                value={commentType}
                onChange={e => setCommentType(e.target.value as DPDPDpiaCommentType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-purple-500"
              >
                <option value="RISK_OBJECTION">🚨 Risk Objection (Security / Privacy Concern)</option>
                <option value="SAFEGUARD_PROPOSAL">🛡️ Safeguard Proposal (Mitigation Recommendation)</option>
                <option value="LEGAL_COMPLIANCE_NOTE">⚖️ Legal & Regulatory Note (DPDP Clause Reference)</option>
                <option value="DEPARTMENT_SIGN_OFF">✅ Department Formal Sign-Off / Concurrence</option>
                <option value="GENERAL_NOTE">💬 General Collaborative Note</option>
              </select>
            </div>
          </div>

          {/* Custom reviewer fields if selected */}
          {selectedPresetIdx === -1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="Reviewer Full Name"
                  value={customAuthor}
                  onChange={e => setCustomAuthor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Role / Title"
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Department Name"
                  value={customDept}
                  onChange={e => setCustomDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Statutory clause reference */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
              Statutory Clause Reference (Optional):
            </label>
            <input
              type="text"
              value={statutoryClause}
              onChange={e => setStatutoryClause(e.target.value)}
              placeholder="e.g. Section 8(5) Safeguards, Section 9 Minor Protections, Section 6(1) Notice"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
              Detailed Assessment Observation / Review Finding:
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Provide technical evaluation, observed vulnerability, proportionality concern, or required technical safeguard..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">
              Note will be sealed with verifiable SHA-256 cryptographic audit timestamp.
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/30"
              >
                <Send className="w-3 h-3" />
                <span>Commit Audit-Trailed Note</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* FILTER BAR FOR COMMENTS */}
      {comments.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[11px]"
            >
              <option value="ALL">All Categories ({comments.length})</option>
              <option value="RISK_OBJECTION">🚨 Risk Objections</option>
              <option value="SAFEGUARD_PROPOSAL">🛡️ Safeguard Proposals</option>
              <option value="LEGAL_COMPLIANCE_NOTE">⚖️ Legal Notes</option>
              <option value="DEPARTMENT_SIGN_OFF">✅ Department Sign-Offs</option>
              <option value="GENERAL_NOTE">💬 General Notes</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[11px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">🔴 Open Action Required</option>
              <option value="RESOLVED">🟢 Resolved</option>
              <option value="ACCEPTED_INTO_DPIA">🟣 Accepted Into DPIA</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {filteredComments.length} of {comments.length} notes shown
          </div>
        </div>
      )}

      {/* COMMENT THREAD LIST */}
      {filteredComments.length === 0 ? (
        <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400 text-xs">
          No comments matching selected filter. Click &ldquo;Leave Department Note&rdquo; above to record observations.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComments.map(comment => {
            let typeBadge = 'bg-slate-800 text-slate-300 border-slate-700';
            let typeIcon = <MessageSquare className="w-3 h-3 text-slate-400" />;

            if (comment.commentType === 'RISK_OBJECTION') {
              typeBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              typeIcon = <AlertTriangle className="w-3 h-3 text-rose-400" />;
            } else if (comment.commentType === 'SAFEGUARD_PROPOSAL') {
              typeBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              typeIcon = <ShieldCheck className="w-3 h-3 text-purple-400" />;
            } else if (comment.commentType === 'LEGAL_COMPLIANCE_NOTE') {
              typeBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              typeIcon = <Scale className="w-3 h-3 text-amber-400" />;
            } else if (comment.commentType === 'DEPARTMENT_SIGN_OFF') {
              typeBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              typeIcon = <Award className="w-3 h-3 text-emerald-400" />;
            }

            const isResolved = comment.status !== 'OPEN';

            return (
              <div
                key={comment.id}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                  comment.commentType === 'RISK_OBJECTION' && !isResolved
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : 'bg-slate-950/90 border-slate-800/90'
                }`}
              >
                {/* Author & Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-white">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400">({comment.authorRole})</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-800 text-slate-300">
                          {comment.department}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(comment.timestamp).toLocaleString()}</span>
                        {comment.statutoryClauseRef && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">{comment.statutoryClauseRef}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges: Category & Status */}
                  <div className="flex items-center space-x-2 shrink-0 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${typeBadge}`}>
                      {typeIcon}
                      <span>{comment.commentType.replace(/_/g, ' ')}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                      comment.status === 'OPEN'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : comment.status === 'ACCEPTED_INTO_DPIA'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {comment.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <p className="text-slate-200 text-xs leading-relaxed pl-9">
                  {comment.content}
                </p>

                {/* Resolution note if present */}
                {comment.resolutionNote && (
                  <div className="ml-9 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolution Attested by {comment.resolvedBy || 'DPO'} on {comment.resolvedAt ? new Date(comment.resolvedAt).toLocaleDateString() : 'Recorded'}</span>
                    </div>
                    <p className="text-slate-300 pl-4">{comment.resolutionNote}</p>
                  </div>
                )}

                {/* Audit proof hash & Action controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 pl-9">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
                    <Hash className="w-3 h-3 text-purple-400/80" />
                    <span className="text-slate-400 font-semibold">Audit Seal:</span>
                    <span className="text-slate-400 hover:text-slate-300 truncate max-w-xs" title={comment.auditEvidenceHash}>
                      {comment.auditEvidenceHash.slice(0, 32)}...
                    </span>
                  </div>

                  {!isResolved && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingCommentId(comment.id);
                          setResolutionTargetStatus('ACCEPTED_INTO_DPIA');
                        }}
                        className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept into DPIA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResolvingCommentId(comment.id);
                          setResolutionTargetStatus('RESOLVED');
                        }}
                        className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolvingCommentId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white">Record Action on Department Note</h4>
              <button
                type="button"
                onClick={() => setResolvingCommentId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Disposition Status:</label>
                <select
                  value={resolutionTargetStatus}
                  onChange={e => setResolutionTargetStatus(e.target.value as DPDPDpiaCommentStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="ACCEPTED_INTO_DPIA">🟣 ACCEPTED INTO DPIA (Technical Safeguard Integrated)</option>
                  <option value="RESOLVED">🟢 RESOLVED (Objection Mitigated / Addressed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resolution Summary & Evidentiary Action:</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  placeholder="Detail the technical or procedural actions taken to satisfy the department head's note..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attesting Official:</label>
                <input
                  type="text"
                  value={resolverName}
                  onChange={e => setResolverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingCommentId(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
