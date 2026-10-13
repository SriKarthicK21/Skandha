import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Hash,
  BookOpen,
  Calendar,
  Sparkles,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { RegulatoryNoticeEvent } from '../../types/regulatoryTypes';
import { PageContainer } from '../layout/PageContainer';

export const RegulatoryChangeSourceRegistryModule: React.FC = () => {
  const {
    regulatorySources,
    regulatoryAuthorities,
    regulatoryNotices,
    acknowledgeRegulatoryNotice,
    setActiveModule
  } = useGRC();

  const [selectedTab, setSelectedTab] = useState<'notices' | 'sources' | 'changelog'>('notices');
  const [filterImpact, setFilterImpact] = useState<string>('ALL');

  const filteredNotices = regulatoryNotices.filter(n => {
    if (filterImpact !== 'ALL' && n.impactLevel !== filterImpact) return false;
    return true;
  });

  return (
    <PageContainer id="regulatory-source-registry-module">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                MAS Horizon Scanning & Regulatory Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                Live Regulatory Feed
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Regulatory Source Documents & MAS Circular Alerts
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Maintain cryptographic provenance of statutory regulatory instruments, track mandatory MAS Notices and supervisory circulars, assess tenant operational impact, and log compliance acknowledgments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Feed Synced with MAS.gov.sg
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800 text-xs">
          <button
            onClick={() => setSelectedTab('notices')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedTab === 'notices'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            MAS Circulars & Notices ({regulatoryNotices.length})
          </button>

          <button
            onClick={() => setSelectedTab('sources')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedTab === 'sources'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Statutory Document Registry ({regulatorySources.length})
          </button>

          <button
            onClick={() => setSelectedTab('changelog')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedTab === 'changelog'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Regulatory Evolution & Changelog
          </button>
        </div>
      </div>

      {/* Tab 1: Live MAS Circulars & Mandatory Notices */}
      {selectedTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing active MAS regulatory advisories and statutory notices requiring tenant review:
            </span>

            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Impact Levels</option>
              <option value="CRITICAL_IMMEDIATE_ACTION">Critical (Immediate Action)</option>
              <option value="HIGH_PLANNED_REMEDIATION">High (Planned Remediation)</option>
              <option value="MEDIUM_POLICY_UPDATE">Medium (Policy Update)</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredNotices.map((notice) => {
              return (
                <div
                  key={notice.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-800/60">
                        {notice.noticeNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        notice.impactLevel === 'CRITICAL_IMMEDIATE_ACTION'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : notice.impactLevel === 'HIGH_PLANNED_REMEDIATION'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-sky-950 text-sky-300 border-sky-700'
                      }`}>
                        {notice.impactLevel.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Issued: {notice.issuedDate} | Effective: {notice.effectiveDate}
                      </span>
                    </div>

                    <div>
                      {notice.acknowledgedByTenant ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acknowledged by Compliance Officer
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeRegulatoryNotice(notice.id)}
                          className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Acknowledge & Accept Action Plan
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notice.summary}
                  </p>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <span className="text-rose-400 font-bold block uppercase text-[10px]">
                      Required Tenant Action:
                    </span>
                    <p className="text-slate-200">
                      {notice.actionRequired}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>Impacted Domains:</span>
                      {notice.impactedDomains.map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>

                    <a
                      href={notice.officialPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      Official MAS PDF Circular <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Statutory Source Documents Registry */}
      {selectedTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regulatorySources.map((source) => {
              return (
                <div
                  key={source.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-800/60">
                        {source.documentNumber}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {source.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800/60">
                      {source.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {source.summary}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Regulatory Category:</span>
                      <span className="text-slate-300 font-semibold">{source.regulatoryCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Publication Date:</span>
                      <span className="text-slate-300">{source.publicationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SHA-256 Checksum:</span>
                      <span className="text-slate-400 font-mono text-[10px] truncate max-w-[200px]">
                        {source.checksumSHA256}
                      </span>
                    </div>
                    {source.officialEnforcementPenalties && (
                      <div className="pt-2 text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-900/40">
                        <strong>Statutory Penalty Clause:</strong> {source.officialEnforcementPenalties}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold"
                    >
                      View at MAS.gov.sg <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Regulatory Changelog */}
      {selectedTab === 'changelog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            MAS TRM Guidelines Evolution Timeline
          </h2>

          <div className="space-y-6 border-l-2 border-rose-900/50 pl-6 ml-2 text-xs">
            <div className="relative space-y-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 absolute -left-[31px] top-1" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">2024–2026: Cyber Resilience & AI Governance Addenda</span>
                <span className="px-2 py-0.2 rounded bg-rose-950 text-rose-300 font-mono text-[10px]">CURRENT STANDARD</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Supervisory focus on algorithmic trading model governance, post-quantum cryptographic roadmap, Endpoint Detection and Response (EDR) mandates on 100% of devices, and strict multi-cloud concentration risk management.
              </p>
            </div>

            <div className="relative space-y-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700 absolute -left-[31px] top-1" />
              <span className="font-bold text-slate-200 text-sm">2021 Revision: Comprehensive TRM Overhaul</span>
              <p className="text-slate-400 leading-relaxed">
                Major rewrite introducing dedicated requirements for DevSecOps, API security, Cloud governance, and codifying the strict 1-hour regulatory incident notification SLA to MAS.
              </p>
            </div>

            <div className="relative space-y-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800 absolute -left-[31px] top-1" />
              <span className="font-bold text-slate-400 text-sm">2013 Edition: Initial Baseline TRM</span>
              <p className="text-slate-500 leading-relaxed">
                Original technology risk guidelines establishing baseline expectations for financial institution IT project management, system availability, and physical datacenter security.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
