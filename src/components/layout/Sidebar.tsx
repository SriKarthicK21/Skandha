import React, { useState, useMemo, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { SidebarNavTooltip, SidebarNavTooltipData } from './SidebarNavTooltip';
import { SidebarSkeletonLoader } from './SidebarSkeletonLoader';
import {
  isCategoryAllowed,
  isModuleAllowed,
  FRAMEWORK_REQUIREMENTS_SPECS
} from '../../utils/frameworkVisibility';
import { getPrimaryBusinessArea, PrimaryBusinessArea } from '../../utils/navigationMapping';
import {
  LayoutDashboard,
  Building,
  ShieldCheck,
  Flame,
  Library,
  ClipboardList,
  Truck,
  ShieldAlert,
  LineChart,
  Settings,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Eye,
  LogOut,
  X,
  Layers,
  CheckCircle2,
  FileSignature,
  Lock,
  CheckSquare,
  Sparkles,
  Search,
  Headphones
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isLoading?: boolean;
}

interface NavSubItem {
  id: string;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}

interface BusinessNavSection {
  id: PrimaryBusinessArea;
  label: string;
  targetModule: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  subItems: NavSubItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onOpenCommandPalette,
  isMobileOpen = false,
  onCloseMobile,
  isLoading = false
}) => {
  const {
    activeModule,
    setActiveModule,
    currentTenant,
    evidence,
    findings,
    tasks,
    unifiedRemediations,
    logout,
    currentRole,
    currentUser,
    isAuthenticated,
    isPreviewRoleActive,
    previewRole,
    canUserAccessModule,
    disableRolePreview,
    savePhase3FrameworkAndGenerate
  } = useGRC();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [frameworkConfigOpen, setFrameworkConfigOpen] = useState(false);
  const [tempFrameworks, setTempFrameworks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState<SidebarNavTooltipData | null>(null);
  const [isResolvingPermissions, setIsResolvingPermissions] = useState<boolean>(false);

  // Re-evaluate or fetch permission-based module visibility during role or framework changes
  useEffect(() => {
    setIsResolvingPermissions(true);
    const timer = setTimeout(() => {
      setIsResolvingPermissions(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentRole, previewRole, currentTenant?.selectedFrameworks]);

  // Listen for global permission/tenant resolution events
  useEffect(() => {
    const handleResolving = (e: Event) => {
      const customEvt = e as CustomEvent<{ resolving?: boolean }>;
      setIsResolvingPermissions(customEvt.detail?.resolving ?? true);
    };
    window.addEventListener('skanda:resolving-permissions', handleResolving);
    return () => window.removeEventListener('skanda:resolving-permissions', handleResolving);
  }, []);

  // Determine whether to display the skeleton loader to eliminate layout shift
  const shouldShowSkeleton = isLoading || isResolvingPermissions || !currentTenant || !currentRole;

  // Clear hovered tooltip when sidebar is expanded
  useEffect(() => {
    if (!isCollapsed) {
      setHoveredTooltip(null);
    }
  }, [isCollapsed]);

  // Global Keyboard Shortcut (Alt + S) to trigger onToggleCollapse
  useEffect(() => {
    if (!onToggleCollapse) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isEditable = target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
        if (isEditable) return;
      }

      // Check for Alt + S (or Option + S on macOS)
      if (e.altKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        onToggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleCollapse]);

  const activePrimaryArea = useMemo(() => getPrimaryBusinessArea(activeModule), [activeModule]);

  const toggleSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] !== undefined ? !prev[sectionId] : activePrimaryArea !== sectionId
    }));
  };

  const isSectionExpanded = (sectionId: string) => {
    if (searchQuery.trim().length > 0) {
      return true;
    }
    if (expandedSections[sectionId] !== undefined) {
      return expandedSections[sectionId];
    }
    // By default, the currently active business area is expanded
    return activePrimaryArea === sectionId;
  };

  const onboardingPhase = currentTenant?.onboardingPhase || 1;
  const openNCs = (findings || []).filter(f => f.status !== 'Closed Verified').length;
  const pendingEv = (evidence || []).filter(e => e.status === 'Pending Review').length;

  // 10 Major Business Workspaces
  const businessSections: BusinessNavSection[] = [
    {
      id: 'home',
      label: 'Home',
      targetModule: 'command_center',
      icon: LayoutDashboard,
      subItems: [
        { id: 'command_center', label: 'Command Center' },
        { id: 'next_best_action', label: 'Next Best Action Cockpit' },
        { id: 'executive_view', label: 'Executive Stakeholder View' },
        { id: 'guided_journey', label: 'Guided Implementation Journey' }
      ]
    },
    {
      id: 'my_work',
      label: 'My Work',
      targetModule: 'my_work',
      icon: CheckSquare,
      badge: (tasks || []).length || 12,
      subItems: [
        { id: 'tasks', label: 'Assigned Tasks & Milestones' },
        { id: 'remediation_queue', label: 'My Remediation Queue' },
        { id: 'my_evidence', label: 'Evidence Upload Queue' },
        { id: 'my_policies', label: 'Document Sign-offs' }
      ]
    },
    {
      id: 'governance',
      label: 'Governance',
      targetModule: 'governance',
      icon: Building,
      subItems: [
        { id: 'org_scope', label: 'Organization & Scope' },
        { id: 'departments', label: 'Departments & Units' },
        { id: 'organizational_discovery', label: 'Organizational Discovery' },
        { id: 'policy_governance', label: 'Policy & Document Governance' },
        { id: 'stakeholder_obligations', label: 'Stakeholder Obligations (Cl. 4.2)' },
        { id: 'policies', label: 'Policies & SOPs' },
        { id: 'management_review', label: 'Management Review' }
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance',
      targetModule: 'compliance',
      icon: ShieldCheck,
      badge: currentTenant?.selectedFrameworks?.length || 4,
      subItems: [
        { id: 'compliance_programs', label: 'Compliance Programs' },
        { id: 'frameworks', label: 'Frameworks Portfolio' },
        { id: 'mapping_explorer', label: 'Cross-Framework Explorer' },
        { id: 'iso27001', label: 'ISO 27001 ISMS' },
        { id: 'mas_trm', label: 'MAS TRM 2021' },
        { id: 'iso42001', label: 'ISO 42001 AI' },
        { id: 'dpdp', label: 'DPDP Act & PIMS' },
        { id: 'live_monitoring', label: 'Live Monitoring & Drift' },
        { id: 'gap_assessment', label: 'Gap Assessment' },
        { id: 'crosswalk', label: 'Harmonization Crosswalk' }
      ]
    },
    {
      id: 'risk',
      label: 'Risk',
      targetModule: 'risk',
      icon: Flame,
      subItems: [
        { id: 'risk_assessment', label: 'Risk Register & Assessment' },
        { id: 'configurable_risk_matrix', label: 'Configurable Risk Matrix' },
        { id: 'risk_map', label: 'D3.js Risk Matrix & Heatmap' },
        { id: 'risk_treatment', label: 'Treatment Simulator' },
        { id: 'exceptions', label: 'Security Exceptions & Waivers' },
        { id: 'board_risk_appetite', label: 'Board Risk Appetite (RAS)' }
      ]
    },
    {
      id: 'controls_evidence',
      label: 'Controls & Evidence',
      targetModule: 'controls_evidence',
      icon: Library,
      badge: pendingEv > 0 ? `${pendingEv} New` : undefined,
      badgeColor: 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/50',
      subItems: [
        { id: 'control_library', label: 'Control Library & Status' },
        { id: 'control_testing', label: 'Control Testing & Effectiveness' },
        { id: 'smart_evidence', label: 'Smart Evidence Hub' },
        { id: 'evidence_centre', label: 'Evidence Centre & Vault' },
        { id: 'evidence_upload', label: 'Intake & Upload' },
        { id: 'evidence_requirements', label: 'Master Evidence Checklist' },
        { id: 'entity_lineage_graph', label: 'Real-Time Control Graph' }
      ]
    },
    {
      id: 'audit',
      label: 'Audit & Assurance',
      targetModule: 'audit',
      icon: ClipboardList,
      badge: openNCs > 0 ? `${openNCs} NC` : undefined,
      badgeColor: openNCs > 0 ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/50' : undefined,
      subItems: [
        { id: 'internal_audit', label: 'Internal Audit Program' },
        { id: 'auditor_clean_room', label: 'Auditor Clean Room' },
        { id: 'auditor_portal', label: 'Auditor Inspection Portal' },
        { id: 'findings_capa', label: 'Findings & Non-Conformities' },
        { id: 'remediation_desk', label: 'Continuous Remediation & CAPA' },
        { id: 'stage_gate_verifier', label: 'Stage 1 vs 2 Gate Verifier' },
        { id: 'audit_sampling_calculator', label: 'ISO 19011 Sampling Engine' }
      ]
    },
    {
      id: 'assets_third_parties',
      label: 'Assets & Third Parties',
      targetModule: 'assets_third_parties',
      icon: Truck,          subItems: [
            { id: 'assets', label: 'Assets & CMDB' },
            { id: 'vendors', label: 'Vendor Directory & TPRM' },
            { id: 'security_questionnaire', label: 'Security Questionnaire Intelligence' },
            { id: 'mas_critical_systems', label: 'Critical Systems (RTO ≤ 4h)' },
            { id: 'data_information', label: 'Data Classification & Flow' }
          ]
    },
    {
      id: 'reports_insights',
      label: 'Reports & Insights',
      targetModule: 'reports_insights',
      icon: LineChart,
      subItems: [
        { id: 'ciso_executive_summary', label: 'CISO 1-Page Summary' },
        { id: 'board_deck', label: 'Board Risk Committee Deck' },
        { id: 'compliance_heatmap', label: 'Compliance Heatmap Grid' },
        { id: 'compliance_maturity_scorecard', label: 'Maturity Scorecard' },
        { id: 'reports_analytics', label: 'Reports & Analytics Engine' },
        { id: 'standards_academy', label: 'Standards Training Academy' }
      ]
    },
    {
      id: 'skanda_intelligence',
      label: 'Skanda Intelligence',
      targetModule: 'skanda_intelligence',
      icon: Sparkles,
      badge: 'AI & EASM',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50',
      subItems: [
        { id: 'ai_advisor', label: 'Skanda AI Advisory Desk' },
        { id: 'brandguard', label: 'BrandGuard Intelligence Hub' },
        { id: 'attack_surface', label: 'Attack Surface (EASM)' },
        { id: 'threat_intel', label: 'Threat Intel & IoCs' },
        { id: 'dark_web', label: 'Dark Web & Credential Leaks' },
        { id: 'logo_monitoring', label: 'Visual Logo Brand Abuse' },
        { id: 'takedowns', label: 'Takedowns & WIPO Desk' },
        { id: 'cyber_crisis_war_room', label: 'Cyber Crisis War Room' }
      ]
    },
    {
      id: 'service_management',
      label: 'Service Management',
      targetModule: 'service_management',
      icon: Headphones,
      badge: 'SLA 99.8%',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50',
      subItems: [
        { id: 'support_centre', label: 'Support Centre & Queue' },
        { id: 'my_cases', label: 'My Cases' },
        { id: 'incidents', label: 'Incident Command Room' },
        { id: 'sla_monitor', label: 'SLA Observability' },
        { id: 'knowledge_base', label: 'Knowledge Base' },
        { id: 'service_catalog', label: 'Service Catalog & Topology' },
        { id: 'service_health', label: 'Service Health & Status' },
        { id: 'problem_management', label: 'Problem Management' }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      targetModule: 'settings',
      icon: Settings,
      subItems: [
        { id: 'saas_hub', label: 'Subscription & SaaS Hub' },
        { id: 'settings', label: 'Platform & Security Settings' },
        { id: 'settings_users', label: 'Users, Roles & RBAC' },
        { id: 'workflows', label: 'Universal Workflow Engine' },
        { id: 'integrations', label: 'Integrations & Connectors' },
        { id: 'audit_trail', label: 'Enterprise Audit Ledger' }
      ]
    }
  ];

  // Quick search filtering across all 10 GRC workspaces and their sub-modules
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return businessSections;

    return businessSections
      .map(section => {
        const sectionMatches = section.label.toLowerCase().includes(query) || section.id.toLowerCase().includes(query);
        const matchingSubItems = section.subItems.filter(sub =>
          sub.label.toLowerCase().includes(query) || sub.id.toLowerCase().includes(query)
        );

        if (sectionMatches || matchingSubItems.length > 0) {
          return {
            ...section,
            subItems: sectionMatches && matchingSubItems.length === 0 ? section.subItems : matchingSubItems
          };
        }
        return null;
      })
      .filter((s): s is BusinessNavSection => s !== null);
  }, [businessSections, searchQuery]);

  const handleNavClick = (section: BusinessNavSection) => {
    setActiveModule(section.targetModule);
    // Expand this section
    setExpandedSections(prev => ({ ...prev, [section.id]: true }));
  };

  const renderNavList = (isMobileView = false, closeMobileFn?: () => void) => {
    if (filteredSections.length === 0) {
      return (
        <div className="py-8 px-3 text-center">
          <Search className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-500 mb-2 opacity-60" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No modules found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isSectionActive = activePrimaryArea === section.id;
          const expanded = !isCollapsed && isSectionExpanded(section.id);

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Primary Nav Button */}
              <div
                className={`sidebar-nav-item group relative w-full flex items-center rounded-lg text-xs font-medium cursor-pointer select-none transition-colors duration-150 border ${
                  isCollapsed ? 'justify-center h-10 px-0' : 'justify-between h-9 px-2.5'
                } ${
                  isSectionActive
                    ? 'active sidebar-nav-item-active bg-slate-100/90 dark:bg-slate-800/90 text-primary-900 dark:text-white font-semibold border-slate-200/90 dark:border-slate-700/80 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-transparent'
                }`}
                onMouseEnter={(e) => {
                  if (isCollapsed && !isMobileView) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({
                      title: section.label,
                      badge: section.badge,
                      badgeColor: section.badgeColor,
                      top: rect.top + rect.height / 2,
                      left: rect.right + 10
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isCollapsed) setHoveredTooltip(null);
                }}
                onClick={() => {
                  setHoveredTooltip(null);
                  handleNavClick(section);
                  if (isMobileView) closeMobileFn?.();
                }}
                title={!isCollapsed ? section.label : undefined}
                aria-current={isSectionActive ? 'page' : undefined}
                data-active={isSectionActive ? 'true' : undefined}
              >
                {/* Subtle yet precise active indicator: 2.5px vertical left accent bar */}
                {isSectionActive && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary-600 dark:bg-primary-400 ${
                      isCollapsed ? 'left-0.5' : 'left-0'
                    }`}
                  />
                )}

                <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : 'gap-2.5 flex-1'}`}>
                  <div className="sidebar-icon-container w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={`sidebar-icon w-4 h-4 shrink-0 transition-colors duration-150 ${
                        isSectionActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="truncate text-left leading-none tracking-tight">
                      {section.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                    {section.badge !== undefined && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none ${section.badgeColor || 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'}`}>
                        {section.badge}
                      </span>
                    )}
                    {section.subItems.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => toggleSection(section.id, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform cursor-pointer"
                        title={expanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? '' : '-rotate-90'}`} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contextual Sub-Items */}
              {!isCollapsed && expanded && section.subItems.length > 0 && (() => {
                const allowedSubItems = section.subItems.filter(sub =>
                  isModuleAllowed(sub.id, currentTenant?.selectedFrameworks, currentTenant?.selectedFrameworkRequirements)
                );
                if (allowedSubItems.length === 0) return null;

                return (
                  <div className="ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-1">
                    {allowedSubItems.map((sub) => {
                      const isSubActive = activeModule === sub.id;
                      const isPermitted = canUserAccessModule(sub.id);

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          disabled={!isPermitted}
                          onClick={() => {
                            setActiveModule(sub.id);
                            if (isMobileView) closeMobileFn?.();
                          }}
                          className={`sidebar-sub-item group relative w-full h-8 px-2 flex items-center justify-between rounded-md text-[12px] transition-colors duration-150 border text-left cursor-pointer ${
                            isSubActive
                              ? 'active sidebar-sub-item-active bg-slate-100/90 dark:bg-slate-800/80 text-primary-700 dark:text-primary-300 font-semibold border-slate-200/80 dark:border-slate-700/70 shadow-2xs'
                              : !isPermitted
                              ? 'text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed border-transparent'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border-transparent'
                          }`}
                          title={!isPermitted ? `${sub.label} (Restricted for ${currentRole})` : sub.label}
                          aria-current={isSubActive ? 'page' : undefined}
                          data-active={isSubActive ? 'true' : undefined}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Subtle precise dot indicator for active sub-item */}
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${
                              isSubActive ? 'bg-primary-600 dark:bg-primary-400' : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                            }`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {!isPermitted && <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`sidebar hidden lg:flex shrink-0 h-full border-r flex-col justify-between z-30 select-none bg-sidebar border-stroke text-ink shadow-2xs transition-colors duration-150 ${
          isCollapsed
            ? 'is-collapsed w-[64px] min-w-[64px] max-w-[64px]'
            : 'w-[240px] min-w-[240px] max-w-[240px]'
        }`}
        style={{
          width: isCollapsed ? '64px' : '240px',
          minWidth: isCollapsed ? '64px' : '240px',
          maxWidth: isCollapsed ? '64px' : '240px'
        }}
        aria-label="Sidebar Navigation"
      >
        {/* Top Sidebar Sub-header Controls */}
        <div
          className={`h-11 px-3 border-b shrink-0 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } border-stroke bg-slate-50/70 dark:bg-[#0B132B]/50`}
        >
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Workspaces
            </span>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-lg border transition text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
              title={isCollapsed ? "Expand Sidebar (Alt + S)" : "Collapse Sidebar (Alt + S)"}
              aria-label={isCollapsed ? "Expand Sidebar (Alt + S)" : "Collapse Sidebar (Alt + S)"}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick Search Filter Input at Top of Sidebar */}
        {!isCollapsed ? (
          <div className="px-3 pt-2.5 pb-2 shrink-0 border-b border-slate-100 dark:border-slate-800/80 bg-sidebar">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Filter GRC modules..."
                className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                aria-label="Filter GRC modules"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="px-2 pt-2 pb-1.5 shrink-0 flex justify-center border-b border-slate-100 dark:border-slate-800/80 bg-sidebar">
            <button
              type="button"
              onClick={() => {
                setHoveredTooltip(null);
                onToggleCollapse?.();
              }}
              onMouseEnter={(e) => {
                if (isCollapsed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredTooltip({
                    title: 'Search & Filter Modules',
                    top: rect.top + rect.height / 2,
                    left: rect.right + 10
                  });
                }
              }}
              onMouseLeave={() => {
                if (isCollapsed) setHoveredTooltip(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={!isCollapsed ? "Search & Filter Modules" : undefined}
              aria-label="Search and Filter Modules"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Nav Area */}
        <div
          onScroll={() => {
            if (isCollapsed) setHoveredTooltip(null);
          }}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-[#CBD5E1] dark:scrollbar-thumb-[#273449] bg-sidebar"
        >
          {/* Active Framework Scope Quick Status */}
          {!shouldShowSkeleton && !isCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Layers className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px] truncate">
                  {currentTenant?.selectedFrameworks?.length || 4} Frameworks Active
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempFrameworks(currentTenant?.selectedFrameworks || ['ISO/IEC 27001:2022']);
                  setFrameworkConfigOpen(true);
                }}
                className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline shrink-0 cursor-pointer"
              >
                Scope
              </button>
            </div>
          )}

          {/* 10 Clean Business Modules Navigation List or Skeleton Loader */}
          {shouldShowSkeleton ? (
            <SidebarSkeletonLoader isCollapsed={isCollapsed} />
          ) : (
            renderNavList(false)
          )}
        </div>

        {/* Role Preview Active Indicator in Sidebar */}
        {!isCollapsed && isPreviewRoleActive && (
          <div className="p-2.5 mx-3 mb-2 rounded-xl text-xs border bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center space-x-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                <Eye className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Simulated Persona</span>
              </span>
              <button
                onClick={() => disableRolePreview()}
                className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline font-bold cursor-pointer"
              >
                Exit
              </button>
            </div>
            <div className="text-[11px] mt-1 truncate">
              Role: <span className="font-semibold text-amber-800 dark:text-amber-300">{previewRole}</span>
            </div>
          </div>
        )}

        {/* Collapse & Sign Out Footer */}
        <div className="p-3 border-t flex items-center space-x-2 bg-sidebar border-stroke">
          <button
            onClick={() => {
              setHoveredTooltip(null);
              onToggleCollapse?.();
            }}
            onMouseEnter={(e) => {
              if (isCollapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({
                  title: 'Expand Sidebar (Alt + S)',
                  top: rect.top + rect.height / 2,
                  left: rect.right + 10
                });
              }
            }}
            onMouseLeave={() => {
              if (isCollapsed) setHoveredTooltip(null);
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer text-ink-2 hover:text-[#0F172A] dark:hover:text-white bg-surface hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border-stroke-strong shadow-xs"
            title={!isCollapsed ? 'Collapse Sidebar (Alt + S)' : undefined}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
                <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Alt+S</kbd>
              </>
            )}
          </button>

          <button
            onClick={logout}
            onMouseEnter={(e) => {
              if (isCollapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({
                  title: 'Sign Out / Lock Session',
                  top: rect.top + rect.height / 2,
                  left: rect.right + 10
                });
              }
            }}
            onMouseLeave={() => {
              if (isCollapsed) setHoveredTooltip(null);
            }}
            className="p-2 rounded-lg border transition cursor-pointer text-ink-2 hover:text-[#2563EB] dark:hover:text-[#60A5FA] bg-surface hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border-stroke-strong shadow-xs"
            title={!isCollapsed ? 'Sign Out / Lock Session' : undefined}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Tooltip Component on Collapsed State */}
        <SidebarNavTooltip tooltip={isCollapsed ? hoveredTooltip : null} />
      </aside>

      {/* Mobile Drawer Slide-Over (< lg) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="sidebar sidebar-mobile relative z-10 h-full w-[260px] min-w-[260px] max-w-[260px] border-r flex flex-col justify-between select-none shadow-2xl bg-sidebar border-stroke text-ink">
            <div className="px-4 py-3.5 border-b shrink-0 flex items-center justify-between border-stroke bg-sidebar">
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-wider uppercase text-[#0F2747] dark:text-white">
                  SKANDA
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border uppercase shrink-0 bg-status-ok-wash text-status-ok-ink border-status-ok-border">
                  GRC
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search Filter Input at Top of Mobile Sidebar */}
            <div className="px-3 pt-2.5 pb-2 shrink-0 border-b border-slate-100 dark:border-slate-800/80 bg-sidebar">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Filter GRC modules..."
                  className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  aria-label="Filter GRC modules"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {shouldShowSkeleton ? (
                <SidebarSkeletonLoader isCollapsed={false} />
              ) : (
                renderNavList(true, onCloseMobile)
              )}
            </div>

            <div className="p-3 border-t flex items-center justify-between border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-mono">SKANDA GRC</span>
              <button
                onClick={logout}
                className="p-2 rounded-xl border transition cursor-pointer flex items-center space-x-1.5 px-3 text-slate-700 dark:text-slate-300 hover:text-primary-600 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold">Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Framework Requirements Configuration Modal */}
      {frameworkConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configure Required Frameworks</h3>
                  <p className="text-[11px] text-slate-400">
                    Select the standards your organization requires. Skanda focuses your workspace accordingly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFrameworkConfigOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {FRAMEWORK_REQUIREMENTS_SPECS.map(spec => {
                const isSelected = tempFrameworks.some(
                  f => f.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5)) || f.toLowerCase() === spec.code.toLowerCase()
                );

                return (
                  <div
                    key={spec.key}
                    onClick={() => {
                      setTempFrameworks(prev => {
                        const exists = prev.some(
                          f => f.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5)) || f.toLowerCase() === spec.code.toLowerCase()
                        );
                        if (exists) {
                          if (prev.length <= 1) return prev;
                          return prev.filter(
                            f => !f.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5)) && f.toLowerCase() !== spec.code.toLowerCase()
                          );
                        } else {
                          return [...prev, spec.code];
                        }
                      });
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${spec.badgeColor}`}>
                            {spec.badge}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">{spec.code}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200">{spec.name}</h4>
                        <p className="text-[11px] text-slate-400">{spec.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                <strong className="text-white">{tempFrameworks.length}</strong> Framework{tempFrameworks.length === 1 ? '' : 's'} Selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFrameworkConfigOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    savePhase3FrameworkAndGenerate(tempFrameworks);
                    setFrameworkConfigOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Apply Framework Scope
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
