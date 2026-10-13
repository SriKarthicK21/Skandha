// Skanda BrandGuard — Dedicated Executive Protection & VIP Threat Defense Desk
// Monitors VIP personal email/phone leaks (Dark Web combolists, SIM-swap risk),
// synthetic deepfake audio/video impersonations, and rogue social media impostor profiles.

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Smartphone,
  PhoneCall,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  Radio,
  Share2,
  Mic,
  Video,
  Plus,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import {
  ExecutiveProfile,
  ExecutivePersonalExposure,
  ExecutiveImpostorSocialAlert
} from '../../types/brandguard';
import { BrandGuardExecutiveThreatService } from '../../services/brandguard/brandguardExecutiveThreatService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardExecutiveProtectionDeskProps {
  executives: ExecutiveProfile[];
  onSelectExecutive?: (executive: ExecutiveProfile) => void;
  onOpenAddModal?: () => void;
}

export const BrandGuardExecutiveProtectionDesk: React.FC<BrandGuardExecutiveProtectionDeskProps> = ({
  executives,
  onSelectExecutive,
  onOpenAddModal
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'DARK_WEB_BREACHES' | 'DEEPFAKES' | 'IMPOSTORS'>('OVERVIEW');
  const [exposures, setExposures] = useState<ExecutivePersonalExposure[]>(() =>
    BrandGuardExecutiveThreatService.getExecutiveExposures()
  );
  const [impostors, setImpostors] = useState<ExecutiveImpostorSocialAlert[]>(() =>
    BrandGuardExecutiveThreatService.getExecutiveImpostors()
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateExposureStatus = (id: string, newStatus: ExecutivePersonalExposure['containmentStatus']) => {
    const updated = BrandGuardExecutiveThreatService.updateExposureStatus(id, newStatus);
    setExposures(updated);
    logAuditEvent('UPDATE', 'Executive Threat Containment', `Updated personal exposure containment status to ${newStatus}`);
  };

  const handleUpdateImpostorStatus = (id: string, newStatus: ExecutiveImpostorSocialAlert['takedownStatus']) => {
    const updated = BrandGuardExecutiveThreatService.updateImpostorStatus(id, newStatus);
    setImpostors(updated);
    logAuditEvent('UPDATE', 'Executive Impostor Profile', `Updated impostor profile takedown status to ${newStatus}`);
  };

  const criticalExposuresCount = exposures.filter(e => e.severity === 'CRITICAL' && e.containmentStatus !== 'RESOLVED_CONTAINED').length;
  const activeImpostorsCount = impostors.filter(i => i.takedownStatus !== 'SUSPENDED_BY_PLATFORM').length;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tracked VIP Executives</span>
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold mt-2 block">{executives.length}</span>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Full Board & C-Suite Enrolled</span>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Critical Breach Exposures</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-rose-400 mt-2 block">{criticalExposuresCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Dark web combolists & SIM risk</span>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Synthetic Voice / Deepfakes</span>
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-purple-400 mt-2 block">1 Detected</span>
          <span className="text-[11px] text-slate-400 mt-1 block">CEO Fraud Wire Request Vector</span>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rogue Social Impostors</span>
            <Share2 className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-400 mt-2 block">{activeImpostorsCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Telegram, X & WhatsApp</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Executive Registry & Risk' },
            { id: 'DARK_WEB_BREACHES', label: `Breach & SIM Exposures (${exposures.length})` },
            { id: 'DEEPFAKES', label: 'Deepfake & Voice Telemetry' },
            { id: 'IMPOSTORS', label: `Social Impostors (${impostors.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Executive Profile</span>
          </button>
        )}
      </div>

      {/* SECTION: OVERVIEW */}
      {activeSection === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {executives.map(exec => {
              const execExposures = exposures.filter(e => e.executiveId === exec.id);
              const execImpostors = impostors.filter(i => i.executiveId === exec.id);

              return (
                <div
                  key={exec.id}
                  className={`p-4 rounded-xl border transition-all hover:border-indigo-500/50 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={exec.approvedPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={exec.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold">{exec.fullName}</h4>
                          <span className="text-xs text-indigo-400 font-medium block">{exec.professionalTitle}</span>
                          <span className="text-[10px] text-slate-500">{exec.department}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ACTIVE VIP
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Personal Breach Exposure:</span>
                        <span className={`font-bold ${execExposures.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {execExposures.length} Incidents
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Rogue Social Clones:</span>
                        <span className={`font-bold ${execImpostors.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {execImpostors.length} Flagged
                        </span>
                      </div>
                    </div>
                  </div>

                  {onSelectExecutive && (
                    <button
                      onClick={() => onSelectExecutive(exec)}
                      className="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
                    >
                      View Executive Threat Profile
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: DARK_WEB_BREACHES */}
      {activeSection === 'DARK_WEB_BREACHES' && (
        <div className="space-y-3">
          {exposures.map(exp => (
            <div
              key={exp.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exp.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {exp.severity} EXPOSURE
                  </span>
                  <span className="text-xs font-bold text-slate-200">{exp.executiveName}</span>
                  <span className="text-[11px] font-mono text-slate-400">({exp.details.targetIdentifier})</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">{exp.details.suspectedAttackVector}</p>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center space-x-3">
                  <span>Source: <strong className="text-slate-300">{exp.details.sourceBreachName || 'OSINT'}</strong></span>
                  <span>Discovered: {new Date(exp.discoveredAt).toLocaleDateString()}</span>
                  {exp.details.compromisedPasswordMasked && (
                    <span className="font-mono text-amber-400">Password: {exp.details.compromisedPasswordMasked}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  exp.containmentStatus === 'RESOLVED_CONTAINED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {exp.containmentStatus.replace(/_/g, ' ')}
                </span>
                {exp.containmentStatus !== 'RESOLVED_CONTAINED' && (
                  <button
                    onClick={() => handleUpdateExposureStatus(exp.id, 'RESOLVED_CONTAINED')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Mark Contained
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION: DEEPFAKES */}
      {activeSection === 'DEEPFAKES' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mic className="w-6 h-6 text-purple-400" />
                <div>
                  <h4 className="text-sm font-bold text-purple-200">Synthetic Voice Audio Impersonation Detected</h4>
                  <p className="text-xs text-slate-400">Real-time telephonic acoustic biometrics matched to CEO Karthik Jagannathan.</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                94% SYNTHETIC CONFIDENCE
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 block">Acoustic Artifact Analysis:</span>
              <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                Audio spectral variance shows artificial pitch stabilization, vocoder latency harmonics, and zero ambient room reverberation typical of ElevenLabs / VALL-E clone engines. Target was Finance Director requesting expedited offshore treasury wire.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-amber-300 font-semibold">
                Remediation: Mandated out-of-band dual physical authorization token requirement on all treasury transfers &gt; $50,000.
              </span>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white">
                Download Audio Forensic Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: IMPOSTORS */}
      {activeSection === 'IMPOSTORS' && (
        <div className="space-y-3">
          {impostors.map(imp => (
            <div
              key={imp.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <img
                  src={imp.impostorAvatarUrl}
                  alt={imp.impostorHandle}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                      {imp.platform}
                    </span>
                    <span className="font-bold text-sm text-slate-200">{imp.impostorHandle}</span>
                    <span className="text-xs text-slate-400">targeting {imp.executiveName}</span>
                  </div>
                  <p className="text-xs text-slate-300">{imp.detectedSolicitation}</p>
                  <span className="text-[11px] text-slate-500 block">Followers: {imp.followerCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  imp.takedownStatus === 'SUSPENDED_BY_PLATFORM'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {imp.takedownStatus.replace(/_/g, ' ')}
                </span>
                {imp.takedownStatus !== 'SUSPENDED_BY_PLATFORM' && (
                  <button
                    onClick={() => handleUpdateImpostorStatus(imp.id, 'SUSPENDED_BY_PLATFORM')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Confirm Platform Suspension
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
