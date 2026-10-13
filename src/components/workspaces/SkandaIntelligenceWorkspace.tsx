import React, { useState, useEffect, useMemo } from 'react';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  Sparkles,
  ShieldAlert,
  Globe2,
  AlertOctagon,
  Lock,
  Award,
  Flame,
  Zap,
  Bot,
  Activity
} from 'lucide-react';

import { BrandGuardModule } from '../brandguard/BrandGuardModule';
import { BrandGuardStorageService } from '../../services/brandguard/brandguardStorageService';
import { IncidentResponseTimeline } from '../incident/IncidentResponseTimeline';
import { LiveSecurityScannerModule } from '../modules/LiveSecurityScannerModule';
import { CyberCrisisWarRoomEngine } from '../mas/realtime/CyberCrisisWarRoomEngine';
import { GeminiMultiTurnChatbot } from '../ai/GeminiMultiTurnChatbot';

interface SkandaIntelligenceWorkspaceProps {
  initialTab?: string;
}

export const SkandaIntelligenceWorkspace: React.FC<SkandaIntelligenceWorkspaceProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'ai_advisor');

  useEffect(() => {
    if (initialTab) {
      if ([
        'ai_advisor', 'brandguard', 'attack_surface', 'threat_intel',
        'dark_web', 'logo_monitoring', 'takedowns', 'live_scanner', 'war_room'
      ].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'ai_copilot' || initialTab === 'ai_insights') {
        setActiveTab('ai_advisor');
      } else if (initialTab === 'cyber_crisis_war_room') {
        setActiveTab('war_room');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const brandMetrics = useMemo(() => BrandGuardStorageService.getDashboardMetrics(), []);

  const tabs: WorkspaceTab[] = [
    { id: 'ai_advisor', label: 'Skanda AI Advisory Desk', icon: Bot, badge: 'GenAI 2.5' },
    { id: 'brandguard', label: 'BrandGuard Intelligence Hub', icon: ShieldAlert, badge: 'Unified' },
    { id: 'attack_surface', label: 'Attack Surface (EASM)', icon: Globe2, badge: 'Live Discovery' },
    { id: 'threat_intel', label: 'Threat Intel & IoCs', icon: AlertOctagon },
    { id: 'geo_heatmap', label: 'Threat Origin Heatmap', icon: Globe2, badge: 'D3 Geo' },
    { id: 'dark_web', label: 'Dark Web & Credential Leaks', icon: Lock },
    { id: 'logo_monitoring', label: 'Visual Logo Brand Abuse', icon: Award, badge: 'Vision AI' },
    { id: 'takedowns', label: 'Takedowns & WIPO Desk', icon: Flame, badge: '4h SLA' },
    { id: 'incident_timeline', label: 'Incident Response Timeline', icon: Activity, badge: 'Audit-Ready' },
    { id: 'live_scanner', label: 'Security Scanner', icon: Zap },
    { id: 'war_room', label: 'Cyber Crisis War Room', icon: Flame, badge: '1h SLA' }
  ];

  const stats: WorkspaceStat[] = useMemo(() => {
    if (activeTab === 'brandguard' || activeTab === 'logo_monitoring' || activeTab === 'takedowns' || activeTab === 'attack_surface') {
      return [
        { label: 'Brand Protection Status', value: 'Live Radar Active' },
        { label: 'Detected Impersonations', value: `${brandMetrics.fakeDomainsCount || 8} Active Domains` },
        { label: 'Logo Abuse Metrics', value: `${brandMetrics.logoMisuseCount || 5} Flagged Assets` },
        { label: 'Takedown Success Rate', value: '98.4% (21.4h MTTR)' }
      ];
    }
    return [
      { label: 'Active AI Models', value: 'Gemini 2.5 Flash' },
      { label: 'Brand Protection Status', value: 'Continuous Live Radar' },
      { label: 'Detected Impersonations', value: `${brandMetrics.fakeDomainsCount || 8} Under Radar` },
      { label: 'Takedown Success Rate', value: '98.4%' }
    ];
  }, [activeTab, brandMetrics]);

  const renderContent = () => {
    switch (activeTab) {
      case 'ai_advisor':
      case 'ai_copilot':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[640px]">
            <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Skanda Multi-Turn AI Compliance & Security Advisor</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Converse with specialized regulatory personas: Chief GRC Executive, ISO Lead Auditor, MAS Specialist, and Cyber Architect.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                Grounding Active
              </span>
            </div>
            <GeminiMultiTurnChatbot />
          </div>
        );
      case 'brandguard':
        return <BrandGuardModule initialTab="DASHBOARD" />;
      case 'attack_surface':
        return <BrandGuardModule initialTab="EASM_TAKEOVER" initialZone="ATTACK_SURFACE" />;
      case 'threat_intel':
        return <BrandGuardModule initialTab="ZERO_HOUR_IOC" initialZone="THREAT_INTEL" />;
      case 'geo_heatmap':
        return <BrandGuardModule initialTab="THREAT_HEATMAP" initialZone="THREAT_INTEL" />;
      case 'dark_web':
        return <BrandGuardModule initialTab="LEAKAGE_MONITOR" initialZone="THREAT_INTEL" />;
      case 'logo_monitoring':
        return <BrandGuardModule initialTab="LOGO_MONITORING" initialZone="ALL" />;
      case 'takedowns':
        return <BrandGuardModule initialTab="TAKEDOWN_SLA" initialZone="RESPONSE_ENFORCEMENT" />;
      case 'incident_timeline':
        return (
          <div className="space-y-4">
            <IncidentResponseTimeline isStandalone={true} />
          </div>
        );
      case 'live_scanner':
        return <LiveSecurityScannerModule />;
      case 'war_room':
      case 'cyber_crisis_war_room':
        return <CyberCrisisWarRoomEngine />;
      default:
        return <BrandGuardModule initialTab="DASHBOARD" />;
    }
  };

  return (
    <WorkspaceLayout
      title="Skanda Intelligence & Threat Operations"
      subtitle="AI-assisted compliance advisory, continuous threat intelligence, external attack surface management (EASM), dark web leak detection, and crisis incident response."
      icon={Sparkles}
      iconColor="text-indigo-600 dark:text-indigo-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};

// Backwards compatibility alias
export { SkandaIntelligenceWorkspace as ThreatIntelWorkspace };
