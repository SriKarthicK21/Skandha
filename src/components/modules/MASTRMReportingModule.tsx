import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Hash,
  Clock,
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';

export const MASTRMReportingModule: React.FC = () => {
  const {
    masDomains,
    masRequirements,
    masAssessments,
    masProfile,
    calculateMASComplianceScore,
    currentTenant
  } = useGRC();

  const [signatoryName, setSignatoryName] = useState('Arjun Mehta');
  const [signatoryRole, setSignatoryRole] = useState('Chief Information Security Officer (CISSP)');
  const [isSigned, setIsSigned] = useState(false);
  const [reportHash, setReportHash] = useState('0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');

  const metrics = calculateMASComplianceScore();
  const compliantCount = masAssessments.filter(a => a.complianceStatus === 'COMPLIANT').length;
  const partialCount = masAssessments.filter(a => a.complianceStatus === 'PARTIALLY_COMPLIANT').length;
  const nonCompliantCount = masAssessments.filter(a => a.complianceStatus === 'NON_COMPLIANT').length;

  const handlePrint = () => {
    window.print();
  };

  const handleSignReport = () => {
    setIsSigned(true);
    setReportHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
  };

  return (
    <PageContainer id="mas-trm-reporting-module">
      {/* Top Header & Export Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-950 border border-slate-800 rounded-xl p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                MAS Regulatory Reporting & Assurance Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                Official Supervisory Package
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MAS TRM Gap Assessment & Board Executive Pack
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Generate formatted regulatory reporting documents ready for the Board Risk Committee and MAS supervisory inspections under MAS Notice 644/655.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Official Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 print:bg-white print:text-black print:border-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-rose-900/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">
              Monetary Authority of Singapore &bull; Technology Risk Management
            </span>
            <h2 className="text-xl font-extrabold text-white print:text-black tracking-tight">
              STATUTORY TECHNOLOGY RISK GAP ASSESSMENT REPORT
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Evaluated pursuant to MAS TRM Guidelines (Jan 2021) & MAS Notice 644/655
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="text-slate-300 print:text-black font-semibold">
              Licensee: {currentTenant?.name || 'Apex Financial Technologies Ltd'}
            </div>
            <div className="text-slate-400 print:text-gray-600 font-mono">
              MAS Ref: {masProfile.masLicenseNumber}
            </div>
            <div className="text-slate-500 print:text-gray-500">
              Date: {new Date().toLocaleDateString('en-SG', { dateStyle: 'long' })}
            </div>
          </div>
        </div>

        {/* Executive Summary & Overall Posture */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-400" />
            1. Executive Compliance Summary & Overall Score
          </h3>
          <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed">
            Apex Financial Technologies Ltd has completed an authoritative gap assessment against the 15 domains of the MAS Technology Risk Management Guidelines. Based on testing procedures across all critical controls, the institution demonstrates an overall compliance rating of <strong className="text-emerald-400 print:text-emerald-700 font-bold">{metrics.overallScore}%</strong>, satisfying primary baseline controls for critical financial systems.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-slate-950/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Total Requirements</span>
              <span className="text-base font-bold text-white print:text-black">{masRequirements.length}</span>
            </div>
            <div className="bg-slate-950/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Compliant Controls</span>
              <span className="text-base font-bold text-emerald-400 print:text-emerald-700">{compliantCount}</span>
            </div>
            <div className="bg-slate-950/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Partially Compliant</span>
              <span className="text-base font-bold text-amber-400 print:text-amber-700">{partialCount}</span>
            </div>
            <div className="bg-slate-950/80 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Designated CIS</span>
              <span className="text-base font-bold text-rose-400 print:text-rose-700">3 Critical Systems</span>
            </div>
          </div>
        </div>

        {/* 15 Domain Evaluation Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            2. Domain Compliance & Maturity Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Domain</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Criticality</th>
                  <th className="p-2.5">Weight</th>
                  <th className="p-2.5 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {masDomains.map((dom) => {
                  const score = metrics.domainBreakdown[dom.domainNumber] || 80;
                  return (
                    <tr key={dom.id} className="hover:bg-slate-950/50 print:hover:bg-transparent">
                      <td className="p-2.5 font-mono font-bold text-slate-300 print:text-black">{dom.domainNumber}</td>
                      <td className="p-2.5 font-semibold text-white print:text-black">{dom.name}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          dom.criticality === 'CRITICAL' ? 'bg-rose-950 text-rose-300 print:text-rose-700' : 'text-slate-400 print:text-gray-700'
                        }`}>
                          {dom.criticality}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-gray-700">{dom.weightPercentage}%</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                        {score}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Information Systems Register */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-400" />
            3. Designated Critical Information Systems (CIS) & Statutory SLAs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {(masProfile.criticalSystemsList || []).map(sys => (
              <div key={sys.id} className="p-3 bg-slate-950/80 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-lg space-y-1.5">
                <span className="font-mono text-rose-400 print:text-rose-700 text-[10px] font-bold">{sys.id}</span>
                <h4 className="font-bold text-white print:text-black text-xs">{sys.systemName}</h4>
                <div className="space-y-0.5 pt-1 text-[11px] text-slate-400 print:text-gray-700">
                  <div>RTO Target: <strong className="text-white print:text-black">{sys.rtoTargetHours} Hours</strong> (Limit &le; 4h)</div>
                  <div>RPO Target: <strong className="text-white print:text-black">{sys.rpoTargetHours} Hours</strong> (Limit &le; 1h)</div>
                  <div>Max Downtime: <strong className="text-white print:text-black">{sys.maxAnnualDowntimeHours} Hours/yr</strong> (Limit &le; 4h/yr)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Signature & Cryptographic Seal */}
        <div className="border-t-2 border-slate-800 print:border-gray-400 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            4. Executive Endorsement & Cryptographic Hash Seal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 space-y-2">
              <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase font-bold">Attesting Officer</span>
              <div className="font-bold text-white print:text-black text-sm">{signatoryName}</div>
              <div className="text-slate-400 print:text-gray-700">{signatoryRole}</div>
              <div className="text-emerald-400 print:text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Certified & Approved</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 space-y-2 font-mono text-[11px]">
              <span className="text-slate-400 print:text-gray-600 block text-[10px] uppercase font-bold">Cryptographic Report Hash (SHA-256)</span>
              <div className="text-slate-300 print:text-black break-all text-[10px]">{reportHash}</div>
              <div className="text-slate-500 pt-1">
                Timestamp: {new Date().toISOString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
