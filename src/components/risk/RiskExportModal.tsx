import React, { useState } from 'react';
import { RiskRecord } from '../../types';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  X,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  Share2,
  Table,
  Layers,
  Sparkles
} from 'lucide-react';

interface RiskExportModalProps {
  risks: RiskRecord[];
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
}

export const RiskExportModal: React.FC<RiskExportModalProps> = ({
  risks,
  isOpen,
  onClose,
  selectedCategory
}) => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'summary'>('summary');

  if (!isOpen) return null;

  const filtered = selectedCategory
    ? risks.filter(r => r.category === selectedCategory)
    : risks;

  const handleDownload = () => {
    if (exportFormat === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Risk_Register_${currentTenant?.name || 'Tenant'}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (exportFormat === 'csv') {
      const headers = ['Risk Code', 'Title', 'Category', 'Department', 'Inherent Likelihood', 'Inherent Impact', 'Inherent Score', 'Residual Likelihood', 'Residual Impact', 'Residual Score', 'Treatment Option', 'Owner', 'Status'];
      const rows = filtered.map(r => [
        `"${r.riskCode}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.department}"`,
        r.likelihood,
        r.impact,
        r.inherentScore,
        r.residualLikelihood,
        r.residualImpact,
        r.residualScore,
        `"${r.treatmentOption}"`,
        `"${r.treatmentOwner}"`,
        `"${r.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Risk_Heatmap_Report_${currentTenant?.name || 'Tenant'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.print();
    }

    showToast({
      title: 'Export Generated',
      message: `Risk register report exported in ${exportFormat.toUpperCase()} format.`,
      type: 'success'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Risk Heatmap & Register</h2>
              <p className="text-xs text-slate-400">{filtered.length} Risk items in current scope</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-6 space-y-4 text-xs">
          <label className="font-bold text-slate-300 block">Select Export Output Format</label>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setExportFormat('summary')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                exportFormat === 'summary'
                  ? 'bg-sky-950 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Printer className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-xs">Executive Print / PDF</span>
            </button>

            <button
              onClick={() => setExportFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                exportFormat === 'csv'
                  ? 'bg-sky-950 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs">CSV Spreadsheet</span>
            </button>

            <button
              onClick={() => setExportFormat('json')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                exportFormat === 'json'
                  ? 'bg-sky-950 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-xs">JSON Raw Data</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Organization:</span>
              <span className="font-semibold text-white">{currentTenant?.name || 'Default Org'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Active Filter:</span>
              <span className="font-semibold text-sky-400">{selectedCategory || 'All Categories'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Timestamp:</span>
              <span className="font-mono text-slate-400">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
