import React, { useState } from 'react';
import { X, Check, FileText, AlertCircle } from 'lucide-react';

interface EditScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatement: string;
  onSave: (newStatement: string) => void;
  companyName: string;
}

export const EditScopeModal: React.FC<EditScopeModalProps> = ({
  isOpen,
  onClose,
  currentStatement,
  onSave,
  companyName
}) => {
  const [statement, setStatement] = useState(currentStatement);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!statement.trim()) {
      setError('Scope statement cannot be empty. ISO 27001 Clause 4.3 requires documented scope.');
      return;
    }
    onSave(statement.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-skanda-secondary border border-skanda rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-scope-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-skanda flex items-center justify-between bg-skanda-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[12px] font-medium uppercase tracking-wider text-sky-400">
                ISO 27001 Clause 4.3
              </span>
              <h3 id="edit-scope-title" className="text-[18px] font-bold text-white">
                Edit ISMS Scope Statement
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-skanda-elevated transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-skanda-elevated/60 border border-skanda text-[12px] text-slate-300 leading-relaxed">
            <strong className="text-sky-300">Auditor Requirement:</strong> The ISMS scope must explicitly define
            the organizational units, geographical locations, cloud platforms, and information assets included in
            governance for <span className="text-white font-semibold">{companyName}</span>.
          </div>

          <div className="space-y-2">
            <label htmlFor="scope-textarea" className="block text-[14px] font-medium text-slate-200">
              Formal Scope Boundary Formulation
            </label>
            <textarea
              id="scope-textarea"
              rows={6}
              value={statement}
              onChange={e => {
                setStatement(e.target.value);
                if (error) setError(null);
              }}
              className="w-full p-4 rounded-xl bg-skanda-primary border border-skanda focus:border-sky-500 text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none transition leading-relaxed font-mono"
              placeholder="e.g. The Information Security Management System covers the design, development, cloud operations..."
            />
            <div className="flex justify-between items-center text-[12px] text-slate-400 pt-1">
              <span>Characters: {statement.length}</span>
              <span>Recommended length: 150 - 450 characters</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[12px] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-skanda bg-skanda-card flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[14px] font-medium text-slate-300 hover:text-white hover:bg-skanda-elevated transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-[14px] font-semibold bg-sky-600 hover:bg-sky-500 text-white transition flex items-center space-x-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Save Scope Statement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
