import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Building,
  Users,
  Lock,
  Cpu,
  HelpCircle,
  ChevronRight,
  FileText,
  Sparkles,
  Keyboard,
  FolderArchive,
  Zap
} from 'lucide-react';
import { MASTER_ISO27001_CONTROLS } from '../../data/initialData';
import { ControlItem } from '../../types';
import { ISOClauseHeatmap } from '../compliance/ISOClauseHeatmap';
import { Flame, BarChart3 } from 'lucide-react';
import { AuditorSpeedReviewDock } from '../compliance/AuditorSpeedReviewDock';
import { UnifiedAuditBinderModal } from '../compliance/UnifiedAuditBinderModal';
import { PageContainer } from '../layout/PageContainer';

export const ISO27001WorkbenchModule: React.FC = () => {
  const { controls, updateControl, setActiveModule, theme } = useGRC();
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Speed-Review Dock & Audit Binder state
  const [isSpeedReviewOpen, setIsSpeedReviewOpen] = useState<boolean>(false);
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState<number>(0);
  const [showAuditBinderModal, setShowAuditBinderModal] = useState<boolean>(false);

  // Selected control for modal
  const [selectedControl, setSelectedControl] = useState<ControlItem | null>(null);
  const [editStatus, setEditStatus] = useState<ControlItem['implementationStatus']>('Implemented');
  const [editJustification, setEditJustification] = useState<string>('');
  const [editApplicable, setEditApplicable] = useState<boolean>(true);

  const iso27001Controls = controls.filter(c => !c.framework || c.framework.includes('27001'));
  const allControls = iso27001Controls.length > 0 ? iso27001Controls : MASTER_ISO27001_CONTROLS.map((c, i) => ({ ...c, id: `ctrl_demo_27k_${i}` }));

  const themes = ['All', 'Organizational', 'People', 'Physical', 'Technological'];

  const filteredControls = allControls.filter(ctrl => {
    const matchTheme = selectedTheme === 'All' || ctrl.category.toLowerCase().includes(selectedTheme.toLowerCase());
    const matchStatus = statusFilter === 'All' || ctrl.implementationStatus === statusFilter;
    const matchSearch =
      ctrl.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctrl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctrl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctrl.guidance?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTheme && matchStatus && matchSearch;
  });

  const handleOpenEdit = (ctrl: ControlItem) => {
    setSelectedControl(ctrl);
    setEditStatus(ctrl.implementationStatus);
    setEditJustification(ctrl.justification || '');
    setEditApplicable(ctrl.applicable);
  };

  const handleSaveControl = () => {
    if (!selectedControl) return;
    updateControl(selectedControl.id, {
      implementationStatus: editStatus,
      justification: editJustification,
      applicable: editApplicable
    });
    setSelectedControl(null);
  };

  const exportCSV = () => {
    const headers = ['Control Code', 'Title', 'Theme', 'Framework', 'Applicable', 'Implementation Status', 'Department', 'Frequency', 'Acceptance Criteria'];
    const rows = filteredControls.map(c => [
      `"${c.controlCode}"`,
      `"${c.title}"`,
      `"${c.category}"`,
      `"${c.framework}"`,
      `"${c.applicable ? 'Yes' : 'No'}"`,
      `"${c.implementationStatus}"`,
      `"${c.responsibleDepartment}"`,
      `"${c.collectionFrequency}"`,
      `"${(c.acceptanceCriteria || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO_27001_2022_Annex_A_Controls_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer
      id="iso27001-workbench-module"
      className={`transition-all duration-300 ${isSpeedReviewOpen ? 'xl:pr-[520px]' : ''}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold">
              ISO/IEC 27001:2022
            </span>
            <span className="text-xs text-slate-400">93 Annex A Controls</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Annex A Control Testing & Evaluation Workbench
          </h1>
          <p className="text-xs text-slate-300">
            Audit evaluation, evidence verification, and operational testing across all 4 Annex A themes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="iso27001-speed-review-toggle-btn"
            onClick={() => {
              setIsSpeedReviewOpen(prev => !prev);
              if (!isSpeedReviewOpen && filteredControls.length > 0) {
                setCurrentSpeedIndex(0);
              }
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              isSpeedReviewOpen
                ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-900/40'
                : 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800 text-indigo-300'
            }`}
            title="Toggle Auditor Speed Review Dock (Shortcuts: J/K to navigate, 1/2/3 to update status, E for evidence)"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSpeedReviewOpen ? 'Close Speed Dock' : 'Auditor Speed Dock [J/K]'}</span>
          </button>

          <button
            id="iso27001-audit-binder-btn"
            onClick={() => setShowAuditBinderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-medium text-xs flex items-center space-x-2 transition cursor-pointer"
            title="Consolidated Audit Binder Generator (One-Click ZIP Bundle)"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Binder (ZIP)</span>
          </button>

          <button
            onClick={() => setShowHeatmap(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
              showHeatmap
                ? 'bg-sky-600 hover:bg-sky-500 border-sky-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Hide Maturity Heatmap' : 'Show Clause Heatmap'}</span>
          </button>

          <button
            onClick={() => setActiveModule('iso_mas_improvements')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-2 transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>11 New Controls Hub</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export 93 Controls CSV</span>
          </button>
        </div>
      </div>

      {/* Interactive ISO Clause & Domain Maturity Heatmap Visualization (D3 & Recharts) */}
      {showHeatmap && (
        <ISOClauseHeatmap
          controls={allControls}
          onSelectControl={handleOpenEdit}
          onFilterChange={(theme, status, query) => {
            setSelectedTheme(theme);
            setStatusFilter(status);
            setSearchTerm(query);
          }}
          onRaiseNC={(ctrl) => {
            setActiveModule('internal_audit');
          }}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search control code, title, guidance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            {themes.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All 4 Themes' : `${t} Controls`}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Implemented">Implemented</option>
            <option value="In Progress">In Progress</option>
            <option value="Planned">Planned</option>
            <option value="Audited">Audited</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 whitespace-nowrap">
          Showing <span className="text-white font-semibold">{filteredControls.length}</span> controls
        </span>
      </div>

      {/* Controls Grid */}
      <div className="space-y-3">
        {filteredControls.map((ctrl) => (
          <div
            key={ctrl.id || ctrl.controlCode}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
                  {ctrl.controlCode}
                </span>
                <h3 className="text-sm font-bold text-white">{ctrl.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {ctrl.category}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : ctrl.implementationStatus === 'In Progress'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {ctrl.implementationStatus === 'Implemented' && <CheckCircle2 className="w-3 h-3" />}
                  {ctrl.implementationStatus === 'In Progress' && <Clock className="w-3 h-3" />}
                  <span>{ctrl.implementationStatus}</span>
                </span>

                <button
                  onClick={() => {
                    const idx = filteredControls.findIndex(c => c.id === ctrl.id);
                    if (idx !== -1) {
                      setCurrentSpeedIndex(idx);
                      setIsSpeedReviewOpen(true);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                  title="Open in Auditor Speed-Review Dock (J/K shortcuts enabled)"
                >
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>Speed Review</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(ctrl)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  Audit / Edit
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              {ctrl.description}
            </p>

            {ctrl.guidance && (
              <div className="text-xs text-slate-400 bg-sky-950/20 border border-sky-500/20 p-3 rounded-xl flex items-start space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sky-300">ISO 27002 Guidance: </span>
                  <span>{ctrl.guidance}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block">Department:</span>
                <span className="text-slate-200 font-medium">{ctrl.responsibleDepartment}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Evidence Artifacts:</span>
                <span className="text-slate-200 font-medium">
                  {ctrl.evidenceRequirements ? ctrl.evidenceRequirements.join(', ') : 'Standard Operating Procedure'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Acceptance Criteria:</span>
                <span className="text-slate-200 font-medium">{ctrl.acceptanceCriteria || 'Verified in audit'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedControl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedControl.controlCode}</span>
                <h3 className="text-base font-bold text-white">{selectedControl.title}</h3>
              </div>
              <button onClick={() => setSelectedControl(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Applicability</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="applicable"
                      checked={editApplicable}
                      onChange={() => setEditApplicable(true)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Applicable</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="applicable"
                      checked={!editApplicable}
                      onChange={() => setEditApplicable(false)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Excluded (SoA Justification Required)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Implementation Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Implemented">Implemented (Operating Effectively)</option>
                  <option value="In Progress">In Progress (Remediation Underway)</option>
                  <option value="Planned">Planned (Targeted Next Sprint)</option>
                  <option value="Audited">Audited (Externally Verified)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Statement of Applicability / Justification</label>
                <textarea
                  rows={3}
                  value={editJustification}
                  onChange={(e) => setEditJustification(e.target.value)}
                  placeholder="State operational implementation details or reasons for exclusion..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedControl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveControl}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition shadow-lg shadow-sky-950/50"
              >
                Save Control Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auditor Split-Pane Speed Review Dock */}
      <AuditorSpeedReviewDock
        isOpen={isSpeedReviewOpen}
        onClose={() => setIsSpeedReviewOpen(false)}
        controls={filteredControls}
        currentControlIndex={currentSpeedIndex}
        onSelectControlIndex={setCurrentSpeedIndex}
        onUpdateControl={(controlId, updates) => {
          updateControl(controlId, updates as Partial<ControlItem>);
        }}
        theme={theme}
      />

      {/* Unified Audit Binder Package Modal */}
      <UnifiedAuditBinderModal
        isOpen={showAuditBinderModal}
        onClose={() => setShowAuditBinderModal(false)}
        preselectedFramework="ISO/IEC 27001:2022"
      />
    </PageContainer>
  );
};
