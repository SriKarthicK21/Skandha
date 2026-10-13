import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Briefcase,
  FileCheck2,
  Users,
  Eye,
  ArrowUpRight,
  ArrowRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { DashboardHeader } from './DashboardHeader';
import { FrameworkSelector } from './FrameworkSelector';
import { ComplianceOverview } from './ComplianceOverview';
import { PriorityActionsSection } from './PriorityActionsSection';
import { RiskOverviewSection } from './RiskOverviewSection';
import { FrameworkReadinessTable } from './FrameworkReadinessTable';
import { AuditReadinessCard } from './AuditReadinessCard';
import { ImplementationJourneyLifecycle } from './ImplementationJourneyLifecycle';
import { DepartmentReadinessSection } from './DepartmentReadinessSection';
import { RecentActivityFeed } from './RecentActivityFeed';
import { AICopilotDrawer } from '../ai/AICopilotDrawer';
import { ScoringMethodologyModal, ExportReportModal } from './DashboardModals';
import { WelcomeGuideModal } from './WelcomeGuideModal';
import { DraggableDashboardCard } from './DraggableDashboardCard';
import { DashboardPriorityBar } from './DashboardPriorityBar';
import { DashboardLayoutModal } from './DashboardLayoutModal';
import { ExecutiveStakeholderView } from './ExecutiveStakeholderView';
import { RealTimeEnterpriseDeck } from './RealTimeEnterpriseDeck';
import { LiveTelemetrySensorsIndicator } from './LiveTelemetrySensorsIndicator';
import { EnterpriseRealTimeHUDDrawer } from '../telemetry/EnterpriseRealTimeHUDDrawer';
import { ComplianceHeatmap } from '../compliance/ComplianceHeatmap';
import { ComplianceHeatmapView } from './ComplianceHeatmapView';
import { ComplianceHeatmapWidget } from './ComplianceHeatmapWidget';
import { ComplianceProjectionWidget } from './ComplianceProjectionWidget';
import { AuditComplianceCalendarWidget } from './AuditComplianceCalendarWidget';
import { GlobalRegulatoryNewsWidget } from './GlobalRegulatoryNewsWidget';
import { ComplianceNewsTicker } from './ComplianceNewsTicker';
import { FrameworkMappingWidget } from './FrameworkMappingWidget';
import { ComplianceMaturityTrendWidget } from './ComplianceMaturityTrendWidget';
import { CommandCenterKeyMetrics } from './CommandCenterKeyMetrics';
import { ExecutiveComplianceHealthStrip } from './ExecutiveComplianceHealthStrip';
import { CertificationReadinessCard } from './CertificationReadinessCard';
import { ControlEffectivenessCard } from './ControlEffectivenessCard';
import { EnterpriseRiskHeatmapCard } from './EnterpriseRiskHeatmapCard';
import { AuditReadinessWorkspaceCard } from './AuditReadinessWorkspaceCard';
import { ContinuousComplianceLifecycleBar } from './ContinuousComplianceLifecycleBar';
import { RolePerspectiveSelector, EnterpriseRole } from './RolePerspectiveSelector';
import { ActiveScopeSelector } from './ActiveScopeSelector';
import { PerspectiveActionHub } from './PerspectiveActionHub';
import { ContinuousComplianceWidget } from './ContinuousComplianceWidget';
import { GrcNavigationService, navigateToGrc } from '../../services/grc/grcNavigationService';
import { PageContainer } from '../layout/PageContainer';
import { ExecutiveTriageDesk } from './ExecutiveTriageDesk';
import { OperationalDecisionHub } from './OperationalDecisionHub';
import { EnterpriseDataLineageModal } from '../compliance/EnterpriseDataLineageModal';
import { ComplianceScoreDrillDownModal } from '../compliance/ComplianceScoreDrillDownModal';
import {
  KPIAlertThresholdConfig,
  getStoredKPIAlertConfig,
  saveStoredKPIAlertConfig
} from '../../utils/kpiAlertThresholds';
import { KPIAlertThresholdModal } from './KPIAlertThresholdModal';
import {
  DashboardModuleConfig,
  DashboardModuleId,
  DEFAULT_MODULE_CONFIGS,
  PRIORITY_PRESETS,
  PriorityPreset
} from './dashboardLayoutTypes';

interface CommandCenterDashboardProps {
  initialViewMode?: 'executive' | 'realtime' | 'operational' | 'heatmap';
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  initialViewMode
}) => {
  const { currentTenant, setActiveModule } = useGRC();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'executive' | 'realtime' | 'operational' | 'heatmap'>(initialViewMode || 'executive');

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const [timeRange, setTimeRange] = useState<string>('Q3 2026');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('all');
  const [enterpriseRole, setEnterpriseRole] = useState<EnterpriseRole>(() => 
    (GrcNavigationService.getStoredPerspective('ciso') as EnterpriseRole)
  );
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiCopilotPrompt, setAiCopilotPrompt] = useState<string | undefined>(undefined);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // View Density (Compact vs Expanded) State for hiding/showing sparklines and trend indicators
  const [viewDensity, setViewDensity] = useState<'compact' | 'expanded'>(() => {
    try {
      const saved = localStorage.getItem('skanda_command_center_density');
      return (saved === 'compact' || saved === 'expanded') ? saved : 'expanded';
    } catch {
      return 'expanded';
    }
  });

  const handleViewDensityChange = (newDensity: 'compact' | 'expanded') => {
    setViewDensity(newDensity);
    try {
      localStorage.setItem('skanda_command_center_density', newDensity);
    } catch (e) {
      console.warn('Failed to persist view density state:', e);
    }
    showToast({
      title: newDensity === 'compact' ? 'Compact View Active' : 'Expanded View Active',
      message: newDensity === 'compact'
        ? 'Sparklines and trend indicators hidden for maximum screen real estate.'
        : 'Sparklines and trend indicators visible.',
      type: 'info'
    });
  };

  // Executive KPI Alert Thresholds state
  const [alertConfig, setAlertConfig] = useState<KPIAlertThresholdConfig>(() =>
    getStoredKPIAlertConfig(currentTenant?.id)
  );
  const [isAlertThresholdModalOpen, setIsAlertThresholdModalOpen] = useState<boolean>(false);
  const [isLineageModalOpen, setIsLineageModalOpen] = useState<boolean>(false);
  const [lineageEntityId, setLineageEntityId] = useState<string>('A.5.15');
  const [isScoreDrillDownModalOpen, setIsScoreDrillDownModalOpen] = useState<boolean>(false);

  const handleSaveAlertConfig = (newConfig: KPIAlertThresholdConfig) => {
    setAlertConfig(newConfig);
    saveStoredKPIAlertConfig(newConfig, currentTenant?.id);
  };

  // First-time user welcome guide modal
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      const tenantKey = currentTenant?.id || 'default';
      const dismissedTenant = localStorage.getItem(`skanda_grc_welcome_dismissed_${tenantKey}`);
      const dismissedGlobal = localStorage.getItem('skanda_grc_welcome_dismissed_global');
      return !dismissedTenant && !dismissedGlobal;
    } catch {
      return false;
    }
  });

  // Drag & Drop / Layout state
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('default');
  const [isRealTimeHUDOpen, setIsRealTimeHUDOpen] = useState<boolean>(false);

  // Load modules from storage for active tenant
  const getInitialModules = useCallback((tenantId?: string): DashboardModuleConfig[] => {
    try {
      const key = `grc_command_center_layout_${tenantId || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as DashboardModuleConfig[];
        const savedIds = new Set(parsed.map(m => m.id));
        const missing = DEFAULT_MODULE_CONFIGS.filter(d => !savedIds.has(d.id));
        let result = parsed.map(m => {
          if (m.id === 'recent_activity') {
            const def = DEFAULT_MODULE_CONFIGS.find(d => d.id === 'recent_activity');
            return {
              ...m,
              title: def?.title || m.title,
              shortTitle: def?.shortTitle || m.shortTitle,
              description: def?.description || m.description,
              visible: true
            };
          }
          return m;
        });

        if (missing.length > 0) {
          for (const m of missing) {
            if (m.id === 'compliance_maturity_trend') {
              const overviewIdx = result.findIndex(x => x.id === 'compliance_overview');
              if (overviewIdx !== -1) {
                result.splice(overviewIdx + 1, 0, m);
              } else {
                result.splice(1, 0, m);
              }
            } else if (m.id === 'recent_activity') {
              const prioIdx = result.findIndex(x => x.id === 'priority_actions');
              if (prioIdx !== -1) {
                result.splice(prioIdx + 1, 0, m);
              } else {
                result.splice(3, 0, m);
              }
            } else if (m.id === 'compliance_projection') {
              const overviewIdx = result.findIndex(x => x.id === 'compliance_overview');
              if (overviewIdx !== -1) {
                result.splice(overviewIdx + 1, 0, m);
              } else {
                result.splice(1, 0, m);
              }
            } else if (m.id === 'audit_compliance_calendar') {
              const projIdx = result.findIndex(x => x.id === 'compliance_projection');
              if (projIdx !== -1) {
                result.splice(projIdx + 1, 0, m);
              } else {
                result.splice(2, 0, m);
              }
            } else if (m.id === 'global_regulatory_news') {
              const calIdx = result.findIndex(x => x.id === 'audit_compliance_calendar');
              if (calIdx !== -1) {
                result.splice(calIdx + 1, 0, m);
              } else {
                result.splice(3, 0, m);
              }
            } else if (m.id === 'framework_mapping') {
              const newsIdx = result.findIndex(x => x.id === 'global_regulatory_news');
              if (newsIdx !== -1) {
                result.splice(newsIdx + 1, 0, m);
              } else {
                result.splice(4, 0, m);
              }
            } else {
              result.push(m);
            }
          }
        }
        return result;
      }
    } catch (err) {
      console.warn('Failed to load dashboard layout preferences from storage:', err);
    }
    return DEFAULT_MODULE_CONFIGS;
  }, []);

  const [modules, setModules] = useState<DashboardModuleConfig[]>(() =>
    getInitialModules(currentTenant?.id)
  );

  // Reload modules when tenant switches
  useEffect(() => {
    setModules(getInitialModules(currentTenant?.id));
  }, [currentTenant?.id, getInitialModules]);

  // Persist helper
  const saveModules = (updatedModules: DashboardModuleConfig[], notificationMessage?: string) => {
    setModules(updatedModules);
    try {
      const key = `grc_command_center_layout_${currentTenant?.id || 'default'}`;
      localStorage.setItem(key, JSON.stringify(updatedModules));

      // Asynchronously mirror to server persistence
      fetch('/api/persistence/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          data: updatedModules,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (err) {
      console.warn('Failed to persist dashboard layout:', err);
    }

    if (notificationMessage) {
      showToast({
        title: 'Daily Priorities Updated',
        message: notificationMessage,
        type: 'success'
      });
    }
  };

  // Drag state tracking
  const [draggedModuleId, setDraggedModuleId] = useState<DashboardModuleId | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = useState<DashboardModuleId | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Keyboard shortcut Cmd+J / Ctrl+J to toggle AI Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAiDrawerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateModule = (moduleId: string, options?: any) => {
    if (typeof moduleId === 'object') {
      navigateToGrc(moduleId);
    } else {
      navigateToGrc({ module: moduleId, ...options });
      setActiveModule(moduleId as any);
    }
  };

  // Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, id: DashboardModuleId) => {
    setDraggedModuleId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: DashboardModuleId) => {
    e.preventDefault();
    if (!draggedModuleId || draggedModuleId === targetId) return;

    // Calculate whether hover is in top or bottom half of target card
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'before' : 'after';

    setDragOverModuleId(targetId);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent, targetId: DashboardModuleId) => {
    // Only reset if actually leaving the card boundary
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientY < rect.top ||
      e.clientY >= rect.bottom ||
      e.clientX < rect.left ||
      e.clientX >= rect.right
    ) {
      if (dragOverModuleId === targetId) {
        setDragOverModuleId(null);
        setDropPosition(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: DashboardModuleId) => {
    e.preventDefault();
    if (!draggedModuleId || draggedModuleId === targetId) {
      handleDragEnd();
      return;
    }

    const currentList = [...modules];
    const sourceIndex = currentList.findIndex(m => m.id === draggedModuleId);
    if (sourceIndex === -1) {
      handleDragEnd();
      return;
    }

    const [movedItem] = currentList.splice(sourceIndex, 1);
    let targetIndex = currentList.findIndex(m => m.id === targetId);
    if (targetIndex === -1) {
      currentList.push(movedItem);
    } else {
      if (dropPosition === 'after') {
        targetIndex += 1;
      }
      currentList.splice(targetIndex, 0, movedItem);
    }

    setActivePresetId('custom');
    saveModules(
      currentList,
      `"${movedItem.shortTitle}" set as Priority #${targetIndex + 1}`
    );
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedModuleId(null);
    setDragOverModuleId(null);
    setDropPosition(null);
  };

  // Move Up / Down Buttons
  const handleMoveUp = (id: DashboardModuleId) => {
    const index = modules.findIndex(m => m.id === id);
    if (index <= 0) return;
    const next = [...modules];
    const [moved] = next.splice(index, 1);
    next.splice(index - 1, 0, moved);
    setActivePresetId('custom');
    saveModules(next, `"${moved.shortTitle}" moved up to Priority #${index}`);
  };

  const handleMoveDown = (id: DashboardModuleId) => {
    const index = modules.findIndex(m => m.id === id);
    if (index === -1 || index >= modules.length - 1) return;
    const next = [...modules];
    const [moved] = next.splice(index, 1);
    next.splice(index + 1, 0, moved);
    setActivePresetId('custom');
    saveModules(next, `"${moved.shortTitle}" moved down to Priority #${index + 2}`);
  };

  // Toggle Width (Full 12 cols vs Half 6 cols)
  const handleToggleWidth = (id: DashboardModuleId) => {
    const next = modules.map(m =>
      m.id === id ? { ...m, colSpan: (m.colSpan === 12 ? 6 : 12) as 12 | 6 } : m
    );
    const mod = next.find(m => m.id === id);
    saveModules(
      next,
      `"${mod?.shortTitle}" width changed to ${mod?.colSpan === 12 ? 'Full Width (12 cols)' : 'Half Width (6 cols)'}`
    );
  };

  // Toggle Collapse / Expand
  const handleToggleCollapse = (id: DashboardModuleId) => {
    const next = modules.map(m =>
      m.id === id ? { ...m, collapsed: !m.collapsed } : m
    );
    setModules(next);
    localStorage.setItem(
      `grc_command_center_layout_${currentTenant?.id || 'default'}`,
      JSON.stringify(next)
    );
  };

  // Hide Module
  const handleHideModule = (id: DashboardModuleId) => {
    const mod = modules.find(m => m.id === id);
    const next = modules.map(m => (m.id === id ? { ...m, visible: false } : m));
    saveModules(
      next,
      `"${mod?.shortTitle}" hidden from dashboard. Restore anytime via Customize.`
    );
  };

  // Presets
  const handleSelectPreset = (preset: PriorityPreset) => {
    setActivePresetId(preset.id);
    const next = [...modules].sort((a, b) => {
      const idxA = preset.order.indexOf(a.id);
      const idxB = preset.order.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    // Ensure all are visible when applying a preset
    const withVisible = next.map(m => ({ ...m, visible: true }));
    saveModules(withVisible, `Applied "${preset.label}" daily priority workflow`);
  };

  // Reset to Default
  const handleResetDefault = () => {
    setActivePresetId('default');
    saveModules(DEFAULT_MODULE_CONFIGS, 'Reset dashboard layout to recommended standard order');
  };

  // Save Layout Trigger
  const handleSaveLayout = () => {
    saveModules(modules, 'Daily priority layout saved to your profile and persistent storage');
  };

  // Component Renderer Lookup
  const renderModuleComponent = (id: DashboardModuleId) => {
    switch (id) {
      case 'compliance_overview':
        return (
          <ComplianceOverview
            selectedFrameworkId={selectedFrameworkId}
            onNavigateModule={handleNavigateModule}
            onOpenScoreModal={() => setIsScoreModalOpen(true)}
          />
        );

      case 'compliance_maturity_trend':
        return (
          <ComplianceMaturityTrendWidget
            onNavigateModule={handleNavigateModule}
          />
        );

      case 'compliance_projection':
        return (
          <ComplianceProjectionWidget
            onNavigateModule={handleNavigateModule}
            selectedFrameworkId={selectedFrameworkId}
          />
        );

      case 'audit_compliance_calendar':
        return (
          <AuditComplianceCalendarWidget
            onNavigateModule={handleNavigateModule}
            selectedFrameworkId={selectedFrameworkId}
          />
        );

      case 'global_regulatory_news':
        return (
          <GlobalRegulatoryNewsWidget
            onNavigateModule={handleNavigateModule}
            selectedFrameworkId={selectedFrameworkId}
          />
        );

      case 'framework_mapping':
        return (
          <FrameworkMappingWidget
            onNavigateModule={handleNavigateModule}
            selectedFrameworkId={selectedFrameworkId}
          />
        );

      case 'compliance_heatmap':
        return (
          <ComplianceHeatmapWidget
            onExpandToFullHeatmap={() => setViewMode('heatmap')}
            onNavigateModule={handleNavigateModule}
          />
        );

      case 'priority_actions':
        return <PriorityActionsSection onNavigateModule={handleNavigateModule} />;

      case 'risk_overview':
        return <RiskOverviewSection onNavigateModule={handleNavigateModule} />;

      case 'framework_readiness':
        return <FrameworkReadinessTable onNavigateModule={handleNavigateModule} />;

      case 'audit_readiness':
        return (
          <AuditReadinessCard
            onNavigateModule={handleNavigateModule}
            onOpenMethodologyModal={() => setIsScoreModalOpen(true)}
          />
        );

      case 'journey_lifecycle':
        return <ImplementationJourneyLifecycle onNavigateModule={handleNavigateModule} />;

      case 'department_readiness':
        return <DepartmentReadinessSection onNavigateModule={handleNavigateModule} />;

      case 'recent_activity':
        return <RecentActivityFeed onNavigateModule={handleNavigateModule} />;

      default:
        return null;
    }
  };

  // Filter visible modules
  const visibleModules = modules.filter(m => m.visible);

  return (
    <PageContainer id="command-center-dashboard">
      {/* 1. Dashboard Top Header */}
      <DashboardHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        density={viewDensity}
        onDensityChange={handleViewDensityChange}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
        onExportReport={() => setIsExportModalOpen(true)}
        onCustomize={() => setIsCustomizeModalOpen(true)}
        onOpenWelcomeGuide={() => setIsWelcomeModalOpen(true)}
        onOpenAlertThresholds={() => setIsAlertThresholdModalOpen(true)}
        criticalThreshold={alertConfig.criticalThreshold}
      />

      {/* 2. Real-Time Compliance News Ticker (Google Search Grounded) */}
      <ComplianceNewsTicker
        onNavigateModule={handleNavigateModule}
        selectedFrameworkId={selectedFrameworkId}
      />

      {/* 3. Role-Based Perspective Switcher Bar & Dynamic Active Scope Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <RolePerspectiveSelector
            currentRole={enterpriseRole}
            onSelectRole={setEnterpriseRole}
            className="w-full sm:w-auto"
          />
          <ActiveScopeSelector
            onNavigateModule={handleNavigateModule}
          />
        </div>

        {/* Dynamic Continuous Compliance Telemetry Widget */}
        <ContinuousComplianceWidget />

        {/* Dynamic Operational Decision Hub for Selected Perspective */}
        <PerspectiveActionHub
          currentRole={enterpriseRole}
          onNavigateModule={handleNavigateModule}
        />
      </div>

      {/* View Switch: Read-only Executive Stakeholder View vs Real-Time Enterprise CCM vs Interactive Compliance Heatmap vs Operational Command Center */}
      <AnimatePresence mode="wait" initial={false}>
        {viewMode === 'executive' ? (
          <motion.div
            key="executive"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <ExecutiveStakeholderView
              onSwitchToOperational={() => setViewMode('operational')}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onNavigateModule={handleNavigateModule}
              density={viewDensity}
              onDensityChange={handleViewDensityChange}
            />
          </motion.div>
        ) : viewMode === 'realtime' ? (
          <motion.div
            key="realtime"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <LiveTelemetrySensorsIndicator
              onNavigateModule={handleNavigateModule}
              onOpenRealTimeHUD={() => setIsRealTimeHUDOpen(true)}
            />
            <RealTimeEnterpriseDeck
              onNavigateModule={handleNavigateModule}
              onSwitchToOperational={() => setViewMode('operational')}
            />
          </motion.div>
        ) : viewMode === 'heatmap' ? (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <ComplianceHeatmap
              onNavigateModule={handleNavigateModule}
              onSwitchViewMode={setViewMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="operational"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Operational Decision Hub: Actionable triage for daily practitioners */}
            <OperationalDecisionHub
              onNavigateModule={handleNavigateModule}
              onOpenLineage={(entityId) => {
                setLineageEntityId(entityId);
                setIsLineageModalOpen(true);
              }}
              onOpenScoreDrillDown={() => setIsScoreDrillDownModalOpen(true)}
            />

            {/* Continuous Compliance Lifecycle Pipeline Bar */}
            <ContinuousComplianceLifecycleBar
              onNavigateModule={handleNavigateModule}
            />

            {/* 2. Framework Navigation Selector */}
            <FrameworkSelector
              selectedFrameworkId={selectedFrameworkId}
              onSelectFramework={setSelectedFrameworkId}
            />

            {/* 3. Drag-and-Drop Key Metric Widgets (Risk Status, Tasks Due, Audit Readiness, etc.) */}
            <CommandCenterKeyMetrics
              onNavigateModule={handleNavigateModule}
              onOpenScoreModal={() => setIsScoreModalOpen(true)}
              criticalThreshold={alertConfig.criticalThreshold}
              isAlertPulsingEnabled={alertConfig.isPulsingEnabled}
              onOpenAlertThresholdModal={() => setIsAlertThresholdModalOpen(true)}
              density={viewDensity}
              onDensityChange={handleViewDensityChange}
              className="stagger-cards"
            />

            {/* Continuous Assurance & Audit Readiness Grid (Enterprise GRC Modules) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              <CertificationReadinessCard onNavigateModule={handleNavigateModule} />
              <ControlEffectivenessCard onNavigateModule={handleNavigateModule} />
              <EnterpriseRiskHeatmapCard onNavigateModule={handleNavigateModule} />
              <AuditReadinessWorkspaceCard onNavigateModule={handleNavigateModule} />
            </div>

            {/* 4. Drag-and-Drop Daily Priority Toolbar */}
            <DashboardPriorityBar
              modules={modules}
              activePresetId={activePresetId}
              isReorderMode={isReorderMode}
              onToggleReorderMode={() => setIsReorderMode(prev => !prev)}
              onSelectPreset={handleSelectPreset}
              onResetDefault={handleResetDefault}
              onOpenLayoutModal={() => setIsCustomizeModalOpen(true)}
              onSaveLayout={handleSaveLayout}
            />

            {/* 4. Dynamic Draggable Compliance Modules Grid */}
            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch stagger-cards"
            >
              {visibleModules.map((moduleConfig, index) => (
                <DraggableDashboardCard
                  key={moduleConfig.id}
                  module={moduleConfig}
                  priorityIndex={index}
                  totalModules={visibleModules.length}
                  isReorderMode={isReorderMode}
                  isDragging={draggedModuleId === moduleConfig.id}
                  isDragOver={dragOverModuleId === moduleConfig.id}
                  dropPosition={dragOverModuleId === moduleConfig.id ? dropPosition : null}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggleWidth={handleToggleWidth}
                  onToggleCollapse={handleToggleCollapse}
                  onHide={handleHideModule}
                >
                  {renderModuleComponent(moduleConfig.id)}
                </DraggableDashboardCard>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Right Drawer for AI Chief Consultant */}
      {isAiDrawerOpen && (
        <AICopilotDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => {
            setIsAiDrawerOpen(false);
            setAiCopilotPrompt(undefined);
          }}
          onNavigateModule={handleNavigateModule}
          initialPrompt={aiCopilotPrompt}
        />
      )}

      {/* Scoring Methodology Modal */}
      <ScoringMethodologyModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Drag-and-Drop Layout & Priorities Modal */}
      <DashboardLayoutModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        modules={modules}
        onSaveModules={(updated) => saveModules(updated, 'Dashboard daily priorities updated')}
        onResetDefault={handleResetDefault}
      />

      {/* First-Time User Welcome Guide Modal */}
      <WelcomeGuideModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onNavigateModule={handleNavigateModule}
      />

      {/* Executive KPI Visual Alert Thresholds Modal */}
      <KPIAlertThresholdModal
        isOpen={isAlertThresholdModalOpen}
        onClose={() => setIsAlertThresholdModalOpen(false)}
        config={alertConfig}
        onSaveConfig={handleSaveAlertConfig}
      />

      {/* Skanda Enterprise Real-Time Telemetry HUD Drawer */}
      <EnterpriseRealTimeHUDDrawer
        isOpen={isRealTimeHUDOpen}
        onClose={() => setIsRealTimeHUDOpen(false)}
        onNavigateModule={(modId) => {
          setIsRealTimeHUDOpen(false);
          handleNavigateModule(modId);
        }}
      />

      {/* 8-Hop Data Lineage Modal (Requirement 18) */}
      <EnterpriseDataLineageModal
        isOpen={isLineageModalOpen}
        onClose={() => setIsLineageModalOpen(false)}
        entityId={lineageEntityId}
        onNavigateModule={handleNavigateModule}
      />

      {/* Compliance Score Drill-Down Modal (Requirement 7) */}
      <ComplianceScoreDrillDownModal
        isOpen={isScoreDrillDownModalOpen}
        onClose={() => setIsScoreDrillDownModalOpen(false)}
        initialFrameworkId={selectedFrameworkId !== 'all' ? selectedFrameworkId : 'iso27001'}
        onNavigateModule={handleNavigateModule}
        onOpenLineage={(entityId) => {
          setLineageEntityId(entityId);
          setIsLineageModalOpen(true);
        }}
      />
    </PageContainer>
  );
};
