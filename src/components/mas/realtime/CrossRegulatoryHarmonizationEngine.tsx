import React, { useState, useMemo } from 'react';
import {
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  Globe,
  Sliders,
  Check,
  FolderCheck,
  Eye,
  FileText,
  TrendingUp,
  Scale
} from 'lucide-react';

export interface RegulatoryEquivalencyMapping {
  id: string;
  masControlCode: string;
  masTitle: string;
  masNoticeRef: string;
  iso27001Ref: string;
  nistCsf2Ref: string;
  pciDss4Ref: string;
  euDoraRef: string;
  hkmaSpmRef: string;
  mappingConfidence: number; // e.g. 96%
  harmonizationStatus: 'FULL_EQUIVALENCE' | 'SUBSTANTIAL_EQUIVALENCE' | 'MAS_SPECIFIC_ADDENDUM';
  mappedEvidenceCount: number;
  evidenceDeduplicationRatio: number; // e.g. 5x (1 artifact satisfies 5 frameworks)
  sampleEvidenceTitle: string;
  auditGuidance: string;
}

export type FrameworkPerspective = 'MAS_TRM' | 'ISO_27001' | 'NIST_CSF' | 'PCI_DSS' | 'EU_DORA';

export const CrossRegulatoryHarmonizationEngine: React.FC = () => {
  const [selectedPerspective, setSelectedPerspective] = useState<FrameworkPerspective>('MAS_TRM');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FULL_EQUIVALENCE' | 'SUBSTANTIAL_EQUIVALENCE'>('ALL');
  const [selectedMapping, setSelectedMapping] = useState<RegulatoryEquivalencyMapping | null>(null);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Master Harmonization Matrix
  const [mappings] = useState<RegulatoryEquivalencyMapping[]>([
    {
      id: 'HARM-01',
      masControlCode: 'MAS-TRM-10.1',
      masTitle: 'Privileged Access Management & Hardware/FIDO2 MFA',
      masNoticeRef: 'Notice 655 §4.1 & §4.2 (Binding MFA & PAM Isolation)',
      iso27001Ref: 'Annex A 8.2 & A 9.2 (Privileged Access Rights)',
      nistCsf2Ref: 'PR.AA-01 & PR.AA-05 (Identity & Credential Mgmt)',
      pciDss4Ref: 'Req 8.3 & Req 8.4 (Multi-Factor Auth for all Admin)',
      euDoraRef: 'Art 9(2) (ICT Access Control & Enhanced Auth)',
      hkmaSpmRef: 'TM-E-1 §6.2 (User Access & Strong Authentication)',
      mappingConfidence: 98,
      harmonizationStatus: 'FULL_EQUIVALENCE',
      mappedEvidenceCount: 6,
      evidenceDeduplicationRatio: 5.0,
      sampleEvidenceTitle: 'Okta Enterprise FIDO2 WebAuthn & CyberArk PAM Session Logs',
      auditGuidance: 'One consolidated export of Okta FIDO2 enforcement logs satisfies MAS, ISO, NIST, PCI, and DORA simultaneously.'
    },
    {
      id: 'HARM-02',
      masControlCode: 'MAS-TRM-11.1',
      masTitle: 'Data Encryption at Rest & In-Transit (Cryptographic Agility)',
      masNoticeRef: 'Notice 655 §5.1 (Data Protection & Storage Cryptography)',
      iso27001Ref: 'Annex A 8.24 (Use of Cryptography & Key Management)',
      nistCsf2Ref: 'PR.DS-01 & PR.DS-02 (Data-at-Rest & In-Transit Protection)',
      pciDss4Ref: 'Req 3.4 & Req 3.5 (Protect Stored Account Data)',
      euDoraRef: 'Art 7(1) (ICT Systems Cryptographic Protection)',
      hkmaSpmRef: 'TM-G-1 §4.3 (Information Security & Cryptographic Controls)',
      mappingConfidence: 95,
      harmonizationStatus: 'FULL_EQUIVALENCE',
      mappedEvidenceCount: 8,
      evidenceDeduplicationRatio: 5.0,
      sampleEvidenceTitle: 'AWS KMS Key Policies, TLS 1.3 Cipher Suite Audit, & TDE Certificates',
      auditGuidance: 'AWS KMS customer-managed key rotation records and TLS 1.3 endpoint audits prove compliance across all 5 frameworks.'
    },
    {
      id: 'HARM-03',
      masControlCode: 'MAS-TRM-12.1',
      masTitle: 'Vulnerability Assessment, Patching & Threat-Led Pen Testing',
      masNoticeRef: 'Notice 655 §6.1 (14-day Critical Patch Remediation)',
      iso27001Ref: 'Annex A 8.8 (Management of Technical Vulnerabilities)',
      nistCsf2Ref: 'DE.CM-01 & ID.RA-01 (Vulnerability & Threat Modeling)',
      pciDss4Ref: 'Req 11.3 & Req 6.3.3 (External Pen Test & Patch Cadence)',
      euDoraRef: 'Art 24 & Art 26 (Threat-Led Penetration Testing - TLPT)',
      hkmaSpmRef: 'OR-1 §8.4 (Vulnerability Management & Cyber Exercises)',
      mappingConfidence: 92,
      harmonizationStatus: 'SUBSTANTIAL_EQUIVALENCE',
      mappedEvidenceCount: 5,
      evidenceDeduplicationRatio: 4.8,
      sampleEvidenceTitle: 'Qualys VMDR MTTR Report (<14 Days) & CREST Red Team Final Report',
      auditGuidance: 'MAS strictly enforces a 14-day MTTR cap for critical patches; satisfies NIST and ISO automatically, with minor addendum for DORA TLPT scope.'
    },
    {
      id: 'HARM-04',
      masControlCode: 'MAS-TRM-13.1',
      masTitle: 'Critical Systems Availability, 4-Hour RTO & Disaster Recovery',
      masNoticeRef: 'Notice 644 §4.1 (Mandatory Maximum 4h Downtime / 12mo)',
      iso27001Ref: 'Annex A 8.14 (Redundancy of Information Processing)',
      nistCsf2Ref: 'RC.RP-01 & PR.IR-01 (Resilience & Disaster Recovery)',
      pciDss4Ref: 'Req 12.10 (Incident Response & Business Continuity)',
      euDoraRef: 'Art 11 & Art 12 (ICT BCP, Dual-Site & RTO Thresholds)',
      hkmaSpmRef: 'TM-G-2 §5.1 (Business Continuity & Critical Systems RTO)',
      mappingConfidence: 89,
      harmonizationStatus: 'MAS_SPECIFIC_ADDENDUM',
      mappedEvidenceCount: 4,
      evidenceDeduplicationRatio: 4.2,
      sampleEvidenceTitle: 'Annual DR MEPS+ Failover Execution Video & RTO 42m Audit Logs',
      auditGuidance: 'MAS Notice 644 imposes a statutory 4-hour downtime budget over rolling 12 months; evidence satisfies DORA Art 11 with custom MAS 1h notification rider.'
    },
    {
      id: 'HARM-05',
      masControlCode: 'MAS-TRM-08.1',
      masTitle: 'Network Segmentation, Micro-Perimeters & Zero Trust Architecture',
      masNoticeRef: 'Notice 655 §3.1 (Demarcation of Sensitive IT Systems)',
      iso27001Ref: 'Annex A 8.20 & A 8.22 (Network Security & Segregation)',
      nistCsf2Ref: 'PR.IR-01 & PR.DS-05 (Network Protection & Separation)',
      pciDss4Ref: 'Req 1.2 & Req 1.3 (Network Security Controls & DMZ)',
      euDoraRef: 'Art 9(4) (Network Infrastructure Segregation)',
      hkmaSpmRef: 'TM-E-1 §4.2 (Network Demarcation & Perimeter Security)',
      mappingConfidence: 96,
      harmonizationStatus: 'FULL_EQUIVALENCE',
      mappedEvidenceCount: 7,
      evidenceDeduplicationRatio: 5.0,
      sampleEvidenceTitle: 'Terraform AWS VPC Security Group Rules & Palo Alto Zero-Trust Matrix',
      auditGuidance: 'Infrastructure-as-Code (Terraform) VPC rules and firewall policy dumps satisfy network isolation mandates in full.'
    },
    {
      id: 'HARM-06',
      masControlCode: 'MAS-TRM-05.1',
      masTitle: 'Third-Party & Cloud Outsourcing Continuous Risk Governance',
      masNoticeRef: 'MAS Notice 658 & Guidelines on Outsourcing (Ongoing Due Diligence)',
      iso27001Ref: 'Annex A 5.19 & A 5.21 (Information Security in Supplier Relationships)',
      nistCsf2Ref: 'GV.SC-04 & GV.SC-07 (Cyber Supply Chain Risk Management)',
      pciDss4Ref: 'Req 12.8 (Third-Party Service Provider Management)',
      euDoraRef: 'Art 28 & Art 30 (Contractual Arrangements with ICT Third Parties)',
      hkmaSpmRef: 'SA-2 §3.1 (Outsourcing & Vendor Oversight)',
      mappingConfidence: 94,
      harmonizationStatus: 'FULL_EQUIVALENCE',
      mappedEvidenceCount: 9,
      evidenceDeduplicationRatio: 5.0,
      sampleEvidenceTitle: 'Vendor SOC 2 Type II Bridge Letters, Exit Plans & SLA Review Logs',
      auditGuidance: 'Vendor SOC 2 Type II reports and exit strategy walkthroughs deduplicate 100% of vendor governance requirements across all frameworks.'
    }
  ]);

  // Deduplication Calculations
  const deduplicationStats = useMemo(() => {
    const totalMappings = mappings.length;
    const totalDeduplicatedControls = totalMappings * 5; // Across MAS, ISO, NIST, PCI, DORA
    const totalEvidenceItemsUsed = mappings.reduce((acc, curr) => acc + curr.mappedEvidenceCount, 0);
    const averageMultiplier = (mappings.reduce((acc, curr) => acc + curr.evidenceDeduplicationRatio, 0) / totalMappings).toFixed(1);
    const auditHoursSavedEst = Math.round(totalMappings * 18.5); // ~18.5 hrs saved per cross-mapped control

    return {
      totalMappings,
      totalDeduplicatedControls,
      totalEvidenceItemsUsed,
      averageMultiplier,
      auditHoursSavedEst
    };
  }, [mappings]);

  const filteredMappings = mappings.filter(m => {
    if (statusFilter !== 'ALL' && m.harmonizationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.masControlCode.toLowerCase().includes(q) ||
        m.masTitle.toLowerCase().includes(q) ||
        m.iso27001Ref.toLowerCase().includes(q) ||
        m.nistCsf2Ref.toLowerCase().includes(q) ||
        m.pciDss4Ref.toLowerCase().includes(q) ||
        m.euDoraRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportDeduplicationReport = () => {
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                Cross-Regulatory Harmonization Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                5x MULTI-FRAMEWORK COVERAGE
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Multi-Jurisdictional Cross-Walk & Evidence Deduplication
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Consolidate compliance obligations across MAS TRM, ISO/IEC 27001:2022, NIST CSF 2.0, PCI DSS v4.0.1, and EU DORA.
              Upload evidence once into the vault to simultaneously satisfy multiple statutory audits with certified equivalency mapping.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportDeduplicationReport}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              {exportedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Dossier Packaged!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Harmonized Attestation Pack</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Deduplication Multiplier Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Evidence Multiplier</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-sky-400">{deduplicationStats.averageMultiplier}x</span>
              <span className="text-xs text-emerald-400 font-semibold">(Average)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">1 Artifact satisfies 5 Frameworks</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Unified Controls Covered</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{deduplicationStats.totalDeduplicatedControls}</span>
              <span className="text-xs text-slate-400">across 5 Regimes</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Zero duplicate evidence requests</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Verified Vault Artifacts</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-purple-400">{deduplicationStats.totalEvidenceItemsUsed}</span>
              <span className="text-xs text-slate-400">active files</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Automated cryptographic hashing</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Est. Audit Hours Saved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">{deduplicationStats.auditHoursSavedEst} hrs</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">S$ 68,000+ Big 4 fee reduction</span>
          </div>
        </div>
      </div>

      {/* Perspective Switcher & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Framework Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mr-1">Perspective:</span>
          {(
            [
              { id: 'MAS_TRM', label: 'MAS TRM & Notices', count: '100% Core' },
              { id: 'ISO_27001', label: 'ISO/IEC 27001:2022', count: '93 Ctrl' },
              { id: 'NIST_CSF', label: 'NIST CSF 2.0', count: '6 Functions' },
              { id: 'PCI_DSS', label: 'PCI DSS v4.0.1', count: '12 Reqs' },
              { id: 'EU_DORA', label: 'EU DORA', count: 'Art 6-30' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPerspective(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedPerspective === tab.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-950/80 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cross-walk or clause..."
              className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Equivalencies</option>
            <option value="FULL_EQUIVALENCE">Full Equivalence</option>
            <option value="SUBSTANTIAL_EQUIVALENCE">Substantial Equivalence</option>
          </select>
        </div>
      </div>

      {/* Cross-Walk Matrix Cards */}
      <div className="space-y-4">
        {filteredMappings.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-400/30">
                    {item.masControlCode}
                  </span>
                  <h3 className="text-sm font-bold text-white">{item.masTitle}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">({item.masNoticeRef})</span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Primary Evidence: <span className="text-emerald-400 font-mono">{item.sampleEvidenceTitle}</span>
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  💡 Big 4 Harmonization Note: {item.auditGuidance}
                </p>
              </div>

              {/* Confidence & Multiplier Badges */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Crosswalk Confidence</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{item.mappingConfidence}%</span>
                </div>
                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evidence Reuse</span>
                  <span className="text-base font-bold font-mono text-sky-400">{item.evidenceDeduplicationRatio}x Multiplier</span>
                </div>
                <div className="pl-3 border-l border-slate-800">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      item.harmonizationStatus === 'FULL_EQUIVALENCE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : item.harmonizationStatus === 'SUBSTANTIAL_EQUIVALENCE'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.harmonizationStatus.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Framework Cross-Walk Equivalence Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800/80 text-xs">
              {/* ISO 27001 */}
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPerspective === 'ISO_27001'
                    ? 'bg-sky-950/40 border-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                  <span>ISO/IEC 27001:2022</span>
                  <span className="text-emerald-400">Aligned</span>
                </div>
                <p className="font-mono text-slate-200 text-[11px] font-semibold">{item.iso27001Ref}</p>
              </div>

              {/* NIST CSF 2.0 */}
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPerspective === 'NIST_CSF'
                    ? 'bg-sky-950/40 border-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                  <span>NIST CSF 2.0</span>
                  <span className="text-emerald-400">Aligned</span>
                </div>
                <p className="font-mono text-slate-200 text-[11px] font-semibold">{item.nistCsf2Ref}</p>
              </div>

              {/* PCI DSS v4.0.1 */}
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPerspective === 'PCI_DSS'
                    ? 'bg-sky-950/40 border-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                  <span>PCI DSS v4.0.1</span>
                  <span className="text-emerald-400">Aligned</span>
                </div>
                <p className="font-mono text-slate-200 text-[11px] font-semibold">{item.pciDss4Ref}</p>
              </div>

              {/* EU DORA */}
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPerspective === 'EU_DORA'
                    ? 'bg-sky-950/40 border-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                  <span>EU DORA (Reg 2022/2554)</span>
                  <span className="text-sky-400">Direct Map</span>
                </div>
                <p className="font-mono text-slate-200 text-[11px] font-semibold">{item.euDoraRef}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
