import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Users2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Calendar,
  Layers,
  Search,
  Plus,
  Building,
  Check,
  Globe2,
  Scale
} from 'lucide-react';
import { StakeholderObligationItem } from '../../types';
import { useToast } from '../common/ToastContainer';

export const Clause42StakeholderObligations: React.FC = () => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [obligations, setObligations] = useState<StakeholderObligationItem[]>([
    {
      id: 'OBL-001',
      stakeholder: 'Supervisory Authorities & Regulators (Data Protection)',
      category: 'Statutory/Regulatory',
      jurisdictionOrScope: 'European Union (GDPR) / Singapore (PDPA)',
      needsAndExpectations: 'Implementation of appropriate technical and organizational measures to ensure personal data protection and breach notification within 72 hours.',
      complianceObligations: 'Mandatory technical controls (encryption, pseudonymisation, access logging) and formal DPO appointment.',
      statutoryReference: 'GDPR Article 32 & 33 / Singapore PDPA Section 24',
      mappedControls: ['A.5.34 Privacy & PI Protection', 'A.8.12 Data Leakage Prevention', 'A.8.24 Use of Cryptography'],
      complianceOwner: 'Chief Privacy Officer / DPO',
      evaluationInterval: 'Semi-Annual',
      lastEvaluatedDate: '2026-08-15',
      nextReviewDate: '2027-02-15',
      complianceStatus: 'Fully Met',
      evidenceReference: 'DPIA-2026-Q2 & Privacy Policy v3.1'
    },
    {
      id: 'OBL-002',
      stakeholder: 'Monetary Authority of Singapore (MAS) / Financial Regulators',
      category: 'Statutory/Regulatory',
      jurisdictionOrScope: 'APAC Financial Institutions',
      needsAndExpectations: 'Strict adherence to Technology Risk Management guidelines, MFA for privileged access, and annual penetration testing.',
      complianceObligations: 'Multi-factor authentication on all remote access, 2-hour recovery time objective for critical customer systems.',
      statutoryReference: 'MAS TRM Notice 644 / MAS Cyber Hygiene Notice 655',
      mappedControls: ['A.5.15 Access Control', 'A.8.5 Secure Authentication', 'A.8.29 Security Testing in Dev'],
      complianceOwner: 'Head of Infrastructure Security',
      evaluationInterval: 'Quarterly',
      lastEvaluatedDate: '2026-07-20',
      nextReviewDate: '2026-10-20',
      complianceStatus: 'Fully Met',
      evidenceReference: 'CREST-PenTest-Report-2026.pdf & Okta MFA Audit Logs'
    },
    {
      id: 'OBL-003',
      stakeholder: 'Tier-1 Enterprise Enterprise Clients',
      category: 'Contractual',
      jurisdictionOrScope: 'Global B2B SaaS Customers',
      needsAndExpectations: 'Independent third-party SOC 2 Type II and ISO 27001 certification, 99.9% uptime SLA, and vendor risk assessments.',
      complianceObligations: 'Annual provision of ISO 27001 certificate, prompt notification of security incidents impacting client data within 24h.',
      statutoryReference: 'Customer Master Services Agreement (MSA) Security Schedules',
      mappedControls: ['A.5.19 InfoSec in Supplier Relationships', 'A.5.24 Incident Management Planning'],
      complianceOwner: 'VP of Customer Trust & Legal',
      evaluationInterval: 'Quarterly',
      lastEvaluatedDate: '2026-08-01',
      nextReviewDate: '2026-11-01',
      complianceStatus: 'Fully Met',
      evidenceReference: 'SOC2-Type2-Report-2026.pdf & Client Portal SLA Logs'
    },
    {
      id: 'OBL-004',
      stakeholder: 'EU NIS2 Directive Competent Authorities',
      category: 'Statutory/Regulatory',
      jurisdictionOrScope: 'European Union Critical Entities',
      needsAndExpectations: 'Supply chain cybersecurity risk assessments and senior executive accountability for cybersecurity governance.',
      complianceObligations: 'Risk management measures across all Tier-1 suppliers and mandatory management training.',
      statutoryReference: 'Directive (EU) 2022/2555 (NIS2 Directive) Article 21',
      mappedControls: ['A.5.21 Managing ICT Supply Chain', 'A.6.3 InfoSec Awareness & Training'],
      complianceOwner: 'CISO & General Counsel',
      evaluationInterval: 'Annual',
      lastEvaluatedDate: '2026-06-10',
      nextReviewDate: '2027-06-10',
      complianceStatus: 'Partially Met',
      evidenceReference: 'Supplier Risk Assessment Register v1.4'
    },
    {
      id: 'OBL-005',
      stakeholder: 'Board of Directors & Audit Committee',
      category: 'Corporate Governance',
      jurisdictionOrScope: 'Enterprise Corporate Scope',
      needsAndExpectations: 'Quarterly visibility into residual cyber risk posture, compliance with statutory mandates, and zero regulatory fines.',
      complianceObligations: 'Quarterly CISO dashboard presentation and annual independent audit review.',
      statutoryReference: 'Audit Committee Charter & Corporate Governance Code',
      mappedControls: ['A.5.1 Policies for Information Security', 'A.5.4 Management Responsibilities'],
      complianceOwner: 'Chief Information Security Officer',
      evaluationInterval: 'Quarterly',
      lastEvaluatedDate: '2026-09-05',
      nextReviewDate: '2026-12-05',
      complianceStatus: 'Fully Met',
      evidenceReference: 'Board-Cyber-Briefing-Q3-2026.pdf'
    }
  ]);

  const filteredObligations = useMemo(() => {
    return obligations.filter(item => {
      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        item.stakeholder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceObligations.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.statutoryReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceOwner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [obligations, categoryFilter, searchQuery]);

  const exportCSV = () => {
    const headers = ['Obligation ID', 'Stakeholder', 'Category', 'Jurisdiction', 'Statutory Reference', 'Compliance Obligations', 'Owner', 'Status', 'Review Cadence'];
    const rows = filteredObligations.map(o => [
      o.id,
      `"${o.stakeholder}"`,
      `"${o.category}"`,
      `"${o.jurisdictionOrScope}"`,
      `"${o.statutoryReference}"`,
      `"${o.complianceObligations.replace(/"/g, '""')}"`,
      `"${o.complianceOwner}"`,
      `"${o.complianceStatus}"`,
      `"${o.evaluationInterval}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO27001_Clause4_2_Obligations_${currentTenant?.name || 'Client'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ title: 'Export Successful', message: 'Compliance Obligations Matrix exported as CSV.', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                ISO/IEC 27001:2022 Clause 4.2
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                Interested Parties & Compliance Obligations Matrix
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Statutory, Regulatory & Contractual Obligations Register
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Demonstrate systematic identification of the needs and expectations of interested parties (Clause 4.2 a) and determine which of these requirements become ISMS compliance obligations (Clause 4.2 b), mapped directly to Annex A controls.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/25"
            >
              <Download className="w-4 h-4" />
              <span>Export Obligations Register</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter by stakeholder, regulation, reference or owner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1">Classification:</span>
            {['ALL', 'Statutory/Regulatory', 'Contractual', 'Corporate Governance'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Obligations Grid */}
      <div className="space-y-4">
        {filteredObligations.map(item => {
          const isFullyMet = item.complianceStatus === 'Fully Met';

          return (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3.5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {item.category}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {item.stakeholder}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                    isFullyMet
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {isFullyMet ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{item.complianceStatus}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/70">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold block">Stakeholder Needs & Expectations:</span>
                    <p className="text-slate-200 leading-relaxed mt-0.5">{item.needsAndExpectations}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Adopted ISMS Compliance Obligation:</span>
                    <p className="text-indigo-200 leading-relaxed mt-0.5">{item.complianceObligations}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-slate-400 font-semibold">Statutory Reference / Contract Ref:</span>
                    <div className="text-slate-200 font-mono text-[11px] mt-0.5">{item.statutoryReference}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Mapped ISO 27001 Annex A Controls:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.mappedControls.map((ctrl, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-indigo-900/60 font-mono text-[10px] font-bold">
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Designated Owner: <strong className="text-slate-200">{item.complianceOwner}</strong></span>
                    <span>Review Cadence: <strong className="text-slate-200">{item.evaluationInterval}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
