import React, { useState } from 'react';
import { GeneratedDocument } from '../../types';
import {
  GitBranch,
  X,
  Plus,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface PolicyRevisionModalProps {
  document: GeneratedDocument;
  isOpen: boolean;
  onClose: () => void;
  onSaveRevision: (revision: {
    issueNo: string;
    changeDescription: string;
    pageNo: string;
    approvedBy: string;
    newContent?: string;
  }) => void;
}

export const PolicyRevisionModal: React.FC<PolicyRevisionModalProps> = ({
  document,
  isOpen,
  onClose,
  onSaveRevision
}) => {
  const currentVer = parseFloat(document.version) || 1.0;
  const suggestedMinor = (currentVer + 0.1).toFixed(1);
  const suggestedMajor = (Math.floor(currentVer) + 1.0).toFixed(1);

  const [revisionType, setRevisionType] = useState<'minor' | 'major' | 'custom'>('minor');
  const [issueNo, setIssueNo] = useState(suggestedMinor);
  const [changeDescription, setChangeDescription] = useState('');
  const [pageNo, setPageNo] = useState('All');
  const [approvedBy, setApprovedBy] = useState('Chief Information Security Officer (CISO)');
  const [includeContentUpdate, setIncludeContentUpdate] = useState(false);
  const [newContent, setNewContent] = useState(document.content || '');

  if (!isOpen) return null;

  const handleTypeSelect = (type: 'minor' | 'major' | 'custom') => {
    setRevisionType(type);
    if (type === 'minor') setIssueNo(suggestedMinor);
    else if (type === 'major') setIssueNo(suggestedMajor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) return;

    onSaveRevision({
      issueNo,
      changeDescription: changeDescription.trim(),
      pageNo: pageNo.trim() || 'All',
      approvedBy: approvedBy.trim(),
      newContent: includeContentUpdate ? newContent : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
                  ISO 27001 Cl. 7.5.3 Version Control
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">{document.docCode}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                Create New Policy Revision
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Policy Context Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{document.title}</span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Current Active Version: <span className="font-mono font-bold text-blue-700">v{document.version}</span> • Classification: {document.classification || 'Private (Internal)'}
              </div>
            </div>
          </div>

          {/* Version Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Revision Type & Target Version
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleTypeSelect('minor')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  revisionType === 'minor'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Minor Revision</div>
                <div className="text-[11px] text-slate-500 mt-0.5">v{suggestedMinor} (Refinements & clarifications)</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('major')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  revisionType === 'major'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Major Revision</div>
                <div className="text-[11px] text-slate-500 mt-0.5">v{suggestedMajor} (Substantial framework update)</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('custom')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  revisionType === 'custom'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Custom Issue No</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Specify custom tag or hotfix code</div>
              </button>
            </div>

            {revisionType === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={issueNo}
                  onChange={(e) => setIssueNo(e.target.value)}
                  placeholder="e.g. 1.2.1 or 2026-RevB"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            )}
          </div>

          {/* Change Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Change Description & Auditor Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Detail the rationale for modification (e.g., Aligned with revised ISO 27001:2022 Annex A 5.15 remote access mandates and updated MFA standards)..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Grid: Pages Modified & Approved By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pages / Sections Modified
              </label>
              <input
                type="text"
                value={pageNo}
                onChange={(e) => setPageNo(e.target.value)}
                placeholder="e.g. All, or Pages 4-7, Section 3.2"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Authorized Approver Role
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g. Chief Information Security Officer (CISO)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Option to Edit Policy Content */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeContentUpdate}
                onChange={(e) => setIncludeContentUpdate(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold">Update policy body content text with this revision</span>
            </label>

            {includeContentUpdate && (
              <div className="mt-3">
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Workflow Reset Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-2 text-amber-900 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Compliance Workflow Enforced:</span> Saving a new revision automatically resets the approval stage to <span className="font-bold">Draft</span> to require re-validation by Technical, Legal, and CISO reviewers before publishing.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Revision v{issueNo}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
