import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Save,
  AlertTriangle,
  SlidersHorizontal,
  Cloud,
  Lock,
  Smartphone,
  Server,
  Activity,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASRegulatoryProfile } from '../../types/masTrmFrameworkTypes';
import { evaluateMASApplicability } from '../../services/masApplicabilityEngine';

interface DynamicTRMSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const DynamicTRMSurveyModal: React.FC<DynamicTRMSurveyModalProps> = ({
  isOpen,
  onClose,
  onCompleted
}) => {
  const { masRegulatoryProfile, updateMASRegulatoryProfile, logAuditEvent } = useGRC();

  // Questionnaire state
  const [onlineServices, setOnlineServices] = useState<boolean>(masRegulatoryProfile?.onlineFinancialServicesOffered ?? true);
  const [cloudHosting, setCloudHosting] = useState<string>(masRegulatoryProfile?.cloudAdoptionModel || 'Commercial Cloud SG');
  const [fidoAuth, setFidoAuth] = useState<boolean>(true);
  const [pamEnforced, setPamEnforced] = useState<boolean>(true);
  const [soc247, setSoc247] = useState<boolean>(true);
  const [criticalSystems, setCriticalSystems] = useState<number>(masRegulatoryProfile?.designatedCriticalSystemsCount ?? 5);
  const [materialOutsourcersCount, setMaterialOutsourcersCount] = useState<number>(masRegulatoryProfile?.materialOutsourcers?.length ?? 4);

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  // Calculate dynamic risk complexity
  let complexityScore = 50;
  if (onlineServices) complexityScore += 15;
  if (cloudHosting.includes('Cloud')) complexityScore += 10;
  if (criticalSystems > 3) complexityScore += 15;
  if (materialOutsourcersCount > 3) complexityScore += 10;
  if (pamEnforced) complexityScore -= 10;
  if (soc247) complexityScore -= 10;
  complexityScore = Math.max(20, Math.min(95, complexityScore));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: MASRegulatoryProfile = {
      ...(masRegulatoryProfile || {
        isSingaporeEntity: true,
        isMasRegulated: true,
        entityType: 'BANK_FULL_OR_QUALIFYING',
        licenceType: 'Full Banking Licence',
        regulatedActivities: ['Banking Business', 'Payment Services'],
        financialServicesOffered: ['Retail Deposits'],
        applicableRegimes: ['Banking Act', 'MAS Notice 644', 'MAS Notice 655', 'MAS TRM Guidelines 2021'],
        businessModel: 'Banking',
        designatedCriticalSystemsCount: 5,
        criticalBusinessServices: ['Real-time Payments'],
        cloudAdoptionModel: 'Commercial Cloud SG',
        cloudProviders: ['AWS Singapore'],
        materialOutsourcers: ['Equinix Singapore DC'],
        onlineFinancialServicesOffered: true,
        customerAuthenticationMethods: ['Hardware/Software Token MFA'],
        applicabilityStatus: 'CONFIRMED'
      }),
      onlineFinancialServicesOffered: onlineServices,
      cloudAdoptionModel: cloudHosting,
      designatedCriticalSystemsCount: criticalSystems,
      customerAuthenticationMethods: fidoAuth
        ? ['Hardware/Software Token MFA', 'FIDO2 Biometric Authentication', 'Transaction Signing for High-Risk Transfers']
        : ['Basic SMS OTP MFA'],
      applicabilityStatus: 'CONFIRMED'
    };

    updateMASRegulatoryProfile(updatedProfile);
    evaluateMASApplicability(updatedProfile);

    logAuditEvent?.(
      'UPDATE',
      'TRM_DYNAMIC_SURVEY',
      `Completed MAS TRM Dynamic Profiling Survey. Complexity Score: ${complexityScore}%. Critical Systems: ${criticalSystems}.`
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onCompleted) onCompleted();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Step 3 &bull; Risk Profiling
                </span>
                <span className="text-xs text-slate-400">Section 4.0 Assessment Survey</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Dynamic Technology Risk & Architectural Survey
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Complexity Banner */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">Calculated TRM Architectural Complexity Rating</span>
              <strong className="text-base text-white font-bold">
                {complexityScore >= 75 ? 'Tier 1 - High Statutory Exposure' : complexityScore >= 50 ? 'Tier 2 - Moderate Exposure' : 'Tier 3 - Standard Exposure'}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-rose-400">{complexityScore}%</span>
              <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${complexityScore >= 75 ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${complexityScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Question 1 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Online Financial Services & Customer Portals</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Does your institution provide internet banking, mobile applications, or open banking API interfaces?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setOnlineServices(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    onlineServices ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Yes (In-Scope)
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineServices(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    !onlineServices ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Cloud className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Cloud Architecture & Infrastructure Model</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Public cloud hosting model for core processing or critical business services (TRM Section 5.0).
                  </p>
                </div>
              </div>
              <select
                value={cloudHosting}
                onChange={e => setCloudHosting(e.target.value)}
                className="px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-rose-500 shrink-0"
              >
                <option value="Commercial Cloud SG">Public Cloud SG (AWS/Azure/GCP)</option>
                <option value="Hybrid Multi-Cloud SG">Hybrid Multi-Cloud SG</option>
                <option value="Dedicated Sovereign On-Premises">Dedicated Sovereign Data Centre</option>
              </select>
            </div>

            {/* Question 3 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Strong Customer Authentication (Notice 655 Para 4.1)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hardware/software token MFA or FIDO2 biometric authentication for all customer logins and high-risk transactions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFidoAuth(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    fidoAuth ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Enforced (FIDO2)
                </button>
                <button
                  type="button"
                  onClick={() => setFidoAuth(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    !fidoAuth ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Legacy OTP
                </button>
              </div>
            </div>

            {/* Question 4 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Privileged Access Management & MFA (Notice 655 Para 4.2)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dedicated PAM jump hosts with MFA required for all administrative access to critical infrastructure.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPamEnforced(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    pamEnforced ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Enforced
                </button>
                <button
                  type="button"
                  onClick={() => setPamEnforced(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    !pamEnforced ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  In Progress
                </button>
              </div>
            </div>

            {/* Question 5 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Activity className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">24/7 Security Operations Centre (SOC) & SIEM Monitoring</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Continuous automated security event correlation, intrusion detection, and incident response readiness.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSoc247(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    soc247 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Active 24/7
                </button>
                <button
                  type="button"
                  onClick={() => setSoc247(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    !soc247 ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  Business Hours
                </button>
              </div>
            </div>

            {/* Question 6 */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Server className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Designated Critical Information Systems (CIS)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Systems designated under Notice 644 where unavailability severely disrupts financial services or markets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 font-mono text-xs">Total CIS:</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={criticalSystems}
                  onChange={e => setCriticalSystems(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              Survey responses automatically calibrate TRM applicability & readiness weights
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-all"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Survey Calibrated!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Recalibrate Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
