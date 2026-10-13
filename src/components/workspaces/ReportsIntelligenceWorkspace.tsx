import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  LineChart,
  Award,
  Grid,
  Compass,
  GraduationCap,
  Radio,
  FileText
} from 'lucide-react';

import { CISOExecutiveOnePager } from '../executive/CISOExecutiveOnePager';
import { MASBoardRiskCommitteeDeck } from '../mas/MASBoardRiskCommitteeDeck';
import { ComplianceHeatmap } from '../compliance/ComplianceHeatmap';
import { ComplianceMaturityScorecard } from '../analytics/ComplianceMaturityScorecard';
import { ReportsAnalyticsModule } from '../modules/ReportsAnalyticsModule';
import { StandardsTrainingHubModule } from '../modules/StandardsTrainingHubModule';
import { LiveTelemetryStreamModule } from '../modules/LiveTelemetryStreamModule';

interface ReportsIntelligenceWorkspaceProps {
  initialTab?: string;
}

export const ReportsIntelligenceWorkspace: React.FC<ReportsIntelligenceWorkspaceProps> = ({ initialTab }) => {
  const { setActiveModule } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'ciso_summary');

  useEffect(() => {
    if (initialTab) {
      if (['ciso_summary', 'board_deck', 'heatmap', 'maturity_scorecard', 'analytics', 'standards', 'telemetry'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab === 'ciso_executive_summary') {
        setActiveTab('ciso_summary');
      } else if (initialTab === 'compliance_heatmap') {
        setActiveTab('heatmap');
      } else if (initialTab === 'compliance_maturity_scorecard') {
        setActiveTab('maturity_scorecard');
      } else if (initialTab === 'reports_analytics') {
        setActiveTab('analytics');
      } else if (initialTab === 'standards_academy') {
        setActiveTab('standards');
      } else if (initialTab === 'telemetry_stream') {
        setActiveTab('telemetry');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const tabs: WorkspaceTab[] = [
    { id: 'ciso_summary', label: 'CISO 1-Page Board Summary', icon: Award, badge: 'Board Ready' },
    { id: 'board_deck', label: 'Board Risk Committee Deck', icon: FileText, badge: 'BRC Pack' },
    { id: 'heatmap', label: 'Compliance Heatmap Grid', icon: Grid, badge: 'Maturity Matrix' },
    { id: 'maturity_scorecard', label: 'Maturity Scorecard', icon: Compass, badge: 'Radar D3' },
    { id: 'analytics', label: 'Reports & Analytics Engine', icon: LineChart },
    { id: 'standards', label: 'Standards & Training Academy', icon: GraduationCap, badge: '17 Standards' },
    { id: 'telemetry', label: 'Live Telemetry Stream', icon: Radio, badge: 'Sensors' }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Board Briefing Readiness', value: '100% Prepared' },
    { label: 'Overall ISMS Maturity', value: 'Level 3.6 / 5.0' },
    { label: 'Certified Employees', value: '48 Trained' },
    { label: 'Telemetry Health', value: '99.98% Live' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'ciso_summary':
      case 'ciso_executive_summary':
        return <CISOExecutiveOnePager />;
      case 'board_deck':
      case 'mas_brc_reporting_deck':
        return <MASBoardRiskCommitteeDeck />;
      case 'heatmap':
      case 'compliance_heatmap':
        return <ComplianceHeatmap onNavigateModule={setActiveModule} />;
      case 'maturity_scorecard':
      case 'compliance_maturity_scorecard':
        return <ComplianceMaturityScorecard />;
      case 'analytics':
      case 'reports_analytics':
        return <ReportsAnalyticsModule />;
      case 'standards':
      case 'standards_academy':
        return <StandardsTrainingHubModule />;
      case 'telemetry':
      case 'telemetry_stream':
        return <LiveTelemetryStreamModule />;
      default:
        return <CISOExecutiveOnePager />;
    }
  };

  return (
    <WorkspaceLayout
      title="Reports & Insights"
      subtitle="Synthesize complex GRC datasets into board-level one-pagers, multi-dimensional heatmaps, maturity radars, and audit-ready reporting packs."
      icon={LineChart}
      iconColor="text-purple-600 dark:text-purple-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};

export { ReportsIntelligenceWorkspace as ReportsInsightsWorkspace };

