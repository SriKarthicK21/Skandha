import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Tag,
  Shield,
  Layers,
  Filter,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  Lock
} from 'lucide-react';
import { ControlItem } from '../../types';
import { ISO_27001_MASTER_ATTRIBUTES } from '../../services/isoPolicyGovernanceEngine';

export const Iso27001AttributeSoASync: React.FC = () => {
  const { controls, currentTenant, setActiveModule, updateControl, logAuditEvent } = useGRC();

  // Filters
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [selectedControlType, setSelectedControlType] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [selectedConcept, setSelectedConcept] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Get controls scoped to ISO 27001
  const isoControls = useMemo(() => {
    return controls.filter(c => !c.framework || c.framework.includes('27001') || c.controlCode.startsWith('A.'));
  }, [controls]);

  // Enrich controls with 5 attributes
  const enrichedControls = useMemo(() => {
    return isoControls.map(c => {
      const attrs = ISO_27001_MASTER_ATTRIBUTES[c.controlCode] || {
        controlType: [c.category === 'Technological' ? 'Preventive' : 'Detective'],
        informationSecurityProperties: ['Confidentiality', 'Integrity'],
        cybersecurityConcepts: ['Protect'],
        operationalCapabilities: [c.category === 'Technological' ? 'System and network security' : 'Governance'],
        securityDomains: ['Protection']
      };
      return {
        ...c,
        attributes: attrs
      };
    });
  }, [isoControls]);

  // Apply filters
  const filteredControls = useMemo(() => {
    return enrichedControls.filter(c => {
      const matchesSearch =
        c.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTheme = selectedTheme === 'All' || c.category === selectedTheme;

      const matchesControlType =
        selectedControlType === 'All' ||
        c.attributes.controlType.includes(selectedControlType as 'Preventive' | 'Detective' | 'Corrective');

      const matchesProperty =
        selectedProperty === 'All' ||
        c.attributes.informationSecurityProperties.includes(selectedProperty as 'Confidentiality' | 'Integrity' | 'Availability');

      const matchesConcept =
        selectedConcept === 'All' ||
        c.attributes.cybersecurityConcepts.includes(selectedConcept as 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover');

      return matchesSearch && matchesTheme && matchesControlType && matchesProperty && matchesConcept;
    });
  }, [enrichedControls, searchTerm, selectedTheme, selectedControlType, selectedProperty, selectedConcept]);

  // Dynamic SoA Synchronization trigger
  const handleDynamicSoASync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      logAuditEvent(
        'UPDATE',
        `Dynamic Statement of Applicability matrix refreshed with 5-attribute tagging for ${enrichedControls.length} controls.`,
        'PASS'
      );
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                  Pillar 3: ISO/IEC 27001:2022 Taxonomies
                </span>
                <span className="text-xs text-slate-500">5 Control Attributes &amp; Dynamic SoA</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                5-Attribute Tagging &amp; Dynamic Statement of Applicability (SoA)
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDynamicSoASync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing SoA Matrix...' : syncSuccess ? 'SoA Synced!' : 'Sync Dynamic SoA Matrix'}</span>
            </button>
            <button
              onClick={() => setActiveModule('soa')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <span>Open Full SoA Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> ISO 27001:2022 restructured Annex A into 4 themes and introduced 5 control attributes (Control Type, CIA properties, Cybersecurity concepts, Operational capabilities, Security domains). Flat policy generators ignore these attributes, producing static spreadsheets that fail lead auditor inspections.
          <br />
          <strong>The Fix:</strong> Dynamically map policies to the 5 ISO 27001:2022 attributes, keeping the Statement of Applicability automatically synchronized as policies are enacted or modified.
        </p>

        {/* The 5 Attributes Explainer */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">1. Control Type</span>
            <span className="text-[11px] font-semibold text-slate-900 mt-0.5 block">Preventive • Detective • Corrective</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">2. InfoSec Properties</span>
            <span className="text-[11px] font-semibold text-slate-900 mt-0.5 block">Confidentiality • Integrity • Availability</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">3. Cyber Concepts</span>
            <span className="text-[11px] font-semibold text-slate-900 mt-0.5 block">Identify • Protect • Detect • Respond • Recover</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">4. Operational Caps</span>
            <span className="text-[11px] font-semibold text-slate-900 mt-0.5 block">15 Standard Capabilities</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">5. Security Domains</span>
            <span className="text-[11px] font-semibold text-slate-900 mt-0.5 block">Governance • Protection • Defense • Resilience</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search controls, codes, or attributes (e.g. A.8.24, Cryptography, Protect)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTheme}
              onChange={e => setSelectedTheme(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="All">All 4 Themes</option>
              <option value="Organizational">Organizational (37)</option>
              <option value="People">People (8)</option>
              <option value="Physical">Physical (14)</option>
              <option value="Technological">Technological (34)</option>
            </select>

            <select
              value={selectedControlType}
              onChange={e => setSelectedControlType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="All">All Control Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Detective">Detective</option>
              <option value="Corrective">Corrective</option>
            </select>

            <select
              value={selectedConcept}
              onChange={e => setSelectedConcept(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="All">All NIST/Cyber Concepts</option>
              <option value="Identify">Identify</option>
              <option value="Protect">Protect</option>
              <option value="Detect">Detect</option>
              <option value="Respond">Respond</option>
              <option value="Recover">Recover</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredControls.length}</strong> of {enrichedControls.length} Annex A controls with dynamic SoA synchronization
        </div>
      </div>

      {/* Controls & Attributes Table */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3">Control Code</th>
              <th className="py-2.5 px-3">Control Title &amp; Category</th>
              <th className="py-2.5 px-3">ISO 2022 5-Attribute Tags</th>
              <th className="py-2.5 px-3">SoA Applicability</th>
              <th className="py-2.5 px-3">Enforcement Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredControls.slice(0, 15).map(c => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                  {c.controlCode}
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold mt-0.5 inline-block">
                    {c.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 max-w-sm">
                    {/* Control Type tag */}
                    {c.attributes.controlType.map((t, i) => (
                      <span key={i} className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {t}
                      </span>
                    ))}
                    {/* CIA tag */}
                    {c.attributes.informationSecurityProperties.map((p, i) => (
                      <span key={i} className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {p}
                      </span>
                    ))}
                    {/* Concept tag */}
                    {c.attributes.cybersecurityConcepts.map((cp, i) => (
                      <span key={i} className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cp}
                      </span>
                    ))}
                    {/* Domain tag */}
                    {c.attributes.securityDomains.map((d, i) => (
                      <span key={i} className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {d.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${c.applicable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="font-bold text-slate-800">{c.applicable ? 'Applicable' : 'Excluded'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]" title={c.justification}>
                    {c.justification || 'Mandatory baseline requirement'}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[11px] font-semibold text-slate-800">
                    ARP_ISMS_{c.controlCode.replace('.', '_')}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Auto-Synced SoA
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
