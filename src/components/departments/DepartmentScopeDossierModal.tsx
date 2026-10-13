import React from 'react';
import { DepartmentScopeProfile, TenantCompany } from '../../types';
import {
  X,
  Printer,
  Download,
  Shield,
  FileCheck2,
  Building2,
  CheckCircle2,
  Layers,
  Users,
  Cpu
} from 'lucide-react';

interface Props {
  tenant: TenantCompany | null;
  departmentScopes: DepartmentScopeProfile[];
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentScopeDossierModal: React.FC<Props> = ({
  tenant,
  departmentScopes,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const inScopeDepts = departmentScopes.filter(d => d.isInScope);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl my-auto bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold">ISO 27001:2022 Departmental Scope & Policy Applicability Dossier</h3>
              <p className="text-[11px] text-slate-400">Formal Clause 4.3 & 5.3 Audit Dossier for Lead External Certification</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 font-sans leading-relaxed text-xs printable-content">
          {/* Header Cover */}
          <div className="border-b-2 border-slate-900 pb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-700 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded">
                ISO/IEC 27001:2022 • ISMS CLAUSE 4.3 & 5.3
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              ORGANIZATIONAL DEPARTMENTAL SCOPE & POLICY GOVERNANCE DOSSIER
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Legal Entity: <strong>{tenant?.name || 'ACME Global Enterprise'}</strong> • Industry: <strong>{tenant?.industryType || 'Technology SaaS'}</strong>
            </p>
          </div>

          {/* Scope Narrative Statement */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Master ISMS Scope & Boundary Statement (Clause 4.3)
            </h3>
            <p className="text-slate-700 text-xs italic leading-relaxed">
              &quot;{tenant?.businessScope?.statement || 'The Information Security Management System covers the design, development, cloud operations, customer onboarding, and ongoing maintenance of our SaaS platform, hosted in AWS/cloud regions, and operated from our corporate offices and remote workforce.'}&quot;
            </p>
          </div>

          {/* In-Scope Departments Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              2. In-Scope Functional Units & Departmental Boundaries ({inScopeDepts.length} Units)
            </h3>

            <div className="space-y-4">
              {inScopeDepts.map((dept, idx) => (
                <div key={dept.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {dept.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 pl-7">
                        Lead Asset Owner: <strong className="text-slate-800">{dept.leadOwner}</strong> • Staff Headcount: <strong>{dept.headcount}</strong> • Locations: <strong>{dept.workLocations?.join(', ')}</strong>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {dept.readinessScore}% Audit-Ready (CMMI L{dept.maturityLevel})
                      </span>
                    </div>
                  </div>

                  {/* Scope Boundary */}
                  <div className="pl-7 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Operational Boundary:</div>
                    <p className="text-slate-700 text-xs">{dept.scopeBoundary}</p>
                  </div>

                  {/* Systems & Processes */}
                  <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Critical Systems & Repositories:</div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                        {(dept.criticalAssetsAndSystems || []).map((sys, i) => (
                          <li key={i}>{sys}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Core Business Processes:</div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                        {(dept.coreProcesses || []).map((proc, i) => (
                          <li key={i}>{proc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Policy Compliance Table */}
                  <div className="pl-7 pt-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Mandatory ISMS Policies & SOP Enforcements:
                    </div>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="p-2">Code</th>
                            <th className="p-2">Document Title</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">ISO Clause</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(dept.policyRequirements || []).map(pol => (
                            <tr key={pol.id} className="hover:bg-slate-50/60">
                              <td className="p-2 font-mono font-bold text-blue-700">{pol.docCode}</td>
                              <td className="p-2 font-medium text-slate-900">{pol.title}</td>
                              <td className="p-2 text-slate-500">{pol.type}</td>
                              <td className="p-2 text-slate-600 font-mono">{pol.isoClause}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  pol.status === 'Compliant & Approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {pol.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-500">Prepared by (ISMS Lead Implementer):</div>
              <div className="h-12 border-b border-slate-400 flex items-end pb-1 italic font-medium text-slate-800">
                Arjun Mehta, Lead DevOps Architect
              </div>
              <div className="text-[10px] text-slate-500">Signature & Date</div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-500">Approved by (Chief Information Security Officer):</div>
              <div className="h-12 border-b border-slate-400 flex items-end pb-1 italic font-medium text-slate-800">
                Elena Rostova, CISO
              </div>
              <div className="text-[10px] text-slate-500">Signature & Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
