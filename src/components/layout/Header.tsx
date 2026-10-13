import React, { useState, useEffect, useRef } from 'react';
import { useGRC } from '../../context/GRCContext';
import { UserRole } from '../../types';
import { useToast } from '../common/ToastContainer';
import { SkandaGRCopilotIcon } from '../ai/SkandaGRCopilotIcon';
import { ThemeSwitcher } from './ThemeSwitcher';
import { FontReadabilityMenu } from './FontReadabilityMenu';
import { GlobalEntitySwitcher } from './GlobalEntitySwitcher';
import { UnifiedAuditBinderModal } from '../compliance/UnifiedAuditBinderModal';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  Shield,
  ShieldCheck,
  Building2,
  ChevronDown,
  CheckCircle2,
  Search,
  Bell,
  Menu,
  LogOut,
  Presentation,
  FolderArchive,
  Globe,
  SlidersHorizontal,
  Plus,
  Bot,
  Lock,
  Compass,
  UserCheck,
  Check,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AddOrganizationModal } from '../organization/AddOrganizationModal';
import { useEnterpriseRealTime } from '../../services/telemetry/enterpriseRealTimeService';
import { EnterpriseRealTimeHUDDrawer } from '../telemetry/EnterpriseRealTimeHUDDrawer';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
  onToggleSidebar?: () => void;
  onOpenAiCopilot?: () => void;
  onOpenPresentation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onToggleSidebar,
  onOpenAiCopilot,
  onOpenPresentation
}) => {
  const {
    currentUser,
    currentRole,
    currentTenant,
    tenants,
    users,
    switchRole,
    switchTenant,
    resetAllData,
    activeModule,
    setActiveModule,
    findings,
    evidence,
    logout,
    theme,
    productMode,
    setProductMode,
    activePersona,
    setActivePersona
  } = useGRC();
  const { showToast } = useToast();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [lensDropdownOpen, setLensDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [showAuditBinderModal, setShowAuditBinderModal] = useState(false);
  const [showDemoTenants, setShowDemoTenants] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showRealTimeHUD, setShowRealTimeHUD] = useState(false);

  const { stats } = useEnterpriseRealTime();

  const headerRef = useRef<HTMLElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setTenantDropdownOpen(false);
        setRoleDropdownOpen(false);
        setLensDropdownOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openFindingsCount = findings.filter(f => f.tenantId === currentTenant?.id && f.status !== 'Closed Verified').length;
  const pendingEvidenceCount = evidence.filter(e => e.tenantId === currentTenant?.id && e.status === 'Pending Review').length;

  const availableTenants = tenants.filter(t => showDemoTenants ? true : !t.isDemo);
  const filteredTenants = availableTenants.filter(t =>
    t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    t.industryType.toLowerCase().includes(tenantSearchQuery.toLowerCase())
  );

  const personaLabels: Record<string, string> = {
    EXECUTIVE_CISO: 'CISO Lens',
    GRC_LEAD: 'GRC Lead',
    CONTRIBUTOR: 'Contributor',
    AUDITOR: 'Auditor Clean Room'
  };

  const isLight = theme === 'light';

  const getWorkspaceTitle = (mod: string) => {
    const map: Record<string, string> = {
      command_center: 'Command Center',
      executive_view: 'Executive Overview',
      guided_journey: 'Implementation Journey',
      my_work: 'My Work',
      tasks: 'Tasks & Milestones',
      governance: 'Governance',
      org_scope: 'Organization & Scope',
      departments: 'Departments & Units',
      policies: 'Policies & Standards',
      compliance: 'Compliance',
      frameworks: 'Compliance Frameworks',
      iso27001: 'ISO 27001:2022',
      mas_trm: 'MAS TRM Guidelines',
      iso42001: 'ISO 42001 AI',
      dpdp: 'DPDP Act',
      gap_assessment: 'Gap Assessment',
      risk: 'Risk Management',
      risk_assessment: 'Risk Register',
      risk_map: 'Risk Heatmap',
      controls_evidence: 'Controls & Evidence',
      control_library: 'Control Library',
      evidence_centre: 'Evidence Centre',
      evidence_upload: 'Evidence Upload',
      audit: 'Audit & Assurance',
      internal_audit: 'Internal Audit',
      auditor_portal: 'Auditor Clean Room',
      findings_capa: 'Findings & Non-Conformities',
      remediation_desk: 'Remediation Desk',
      assets_third_parties: 'Assets & Third Parties',
      assets: 'Asset Inventory',
      vendors: 'Vendor Risk (TPRM)',
      reports_insights: 'Reports & Insights',
      ciso_executive_summary: 'CISO 1-Pager',
      compliance_heatmap: 'Compliance Heatmap',
      skanda_intelligence: 'Skanda Intelligence',
      brandguard: 'BrandGuard Hub',
      settings: 'Settings & Security',
      settings_users: 'Users & Permissions'
    };
    return map[mod] || 'Command Center';
  };

  return (
    <header
      ref={headerRef}
      id="app-top-header"
      className={`app-header sticky top-0 z-40 h-[54px] w-full border-b backdrop-blur-md select-none transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#0f172a]/95 border-slate-800 text-slate-100 shadow-xs'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 h-full flex items-center justify-between gap-2 sm:gap-3">
        
        {/* ==================================================================== */}
        {/* 1. LEFT ZONE: Brand Logo & Real-Time CCM Indicator                   */}
        {/* ==================================================================== */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              id="header-sidebar-toggle-btn"
              type="button"
              onClick={onToggleSidebar}
              className={`p-1.5 rounded-lg transition shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle Navigation Sidebar (Alt+S)"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Logo & Brand Name */}
          <button
            type="button"
            onClick={() => setActiveModule('command_center')}
            className="flex items-center space-x-2 cursor-pointer focus:outline-none group text-left select-none"
            title="SKANDA Real-Time Enterprise GRC"
          >
            <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-[#0F2747] to-[#1E3A8A] dark:from-[#1E3A8A] dark:to-[#2563EB] flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0 transition-transform group-hover:scale-105">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-sm leading-tight uppercase font-sans">
                SKANDA
              </span>
              <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Enterprise GRC
              </span>
            </div>
          </button>

          {/* Current Workspace Breadcrumb */}
          <div className="hidden 2xl:flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px] xl:max-w-[180px]">
              {getWorkspaceTitle(activeModule)}
            </span>
          </div>

          {/* Real-Time Live Telemetry CCM Indicator */}
          <button
            id="header-realtime-telemetry-hud-btn"
            type="button"
            onClick={() => setShowRealTimeHUD(true)}
            className={`hidden md:flex items-center space-x-1.5 px-2 py-1 h-7.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer shrink-0 whitespace-nowrap ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200'
                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/60'
            }`}
            title="Open Continuous Compliance Monitoring (CCM) Real-Time Telemetry HUD"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono font-bold text-[10.5px] tracking-tight whitespace-nowrap">LIVE CCM</span>
            <span className="hidden 2xl:inline text-[9.5px] font-mono opacity-80">{stats.latencyMs}ms</span>
          </button>

          {/* High-End Enterprise SaaS Subscription & Region Pill */}
          <button
            onClick={() => setActiveModule('saas_hub' as any)}
            className={`hidden sm:inline-flex items-center space-x-1.5 px-2 py-1 h-7.5 rounded-lg border text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer ${
              isLight
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 border-indigo-300 hover:border-indigo-400'
                : 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
            }`}
            title="Enterprise SaaS Plan: APEX GLOBAL · Click to manage subscriptions, usage meters & regional residency"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-extrabold uppercase tracking-wider text-[10.5px]">APEX GLOBAL</span>
            <span className="hidden xl:inline text-[9.5px] font-mono opacity-80">🇸🇬 AWS · 99.99%</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 2. CENTER ZONE: Command Palette Search                               */}
        {/* ==================================================================== */}
        <div className="flex items-center space-x-2 flex-1 min-w-[140px] sm:min-w-[180px] max-w-xl mx-1 sm:mx-2.5">
          {/* Global Search Bar */}
          <button
            id="header-global-search-btn"
            type="button"
            onClick={onOpenCommandPalette}
            className={`flex items-center justify-between h-8 w-full min-w-0 px-2.5 sm:px-3 rounded-lg border text-xs transition cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              isLight
                ? 'bg-slate-50 hover:bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-1.5 min-w-0 overflow-hidden pr-2">
              <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate font-medium text-xs">
                <span className="hidden md:inline">Search controls, risks, evidence, policies...</span>
                <span className="md:hidden">Search SKANDA...</span>
              </span>
            </div>
            <kbd className={`shrink-0 inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-mono rounded font-semibold ${
              isLight
                ? 'bg-white text-slate-500 border border-slate-300'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 3. RIGHT ZONE: Organization Switcher, Audit Pack CTA, Utilities & AM */}
        {/* ==================================================================== */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          
          {/* Organization / Tenant Switcher */}
          <div className="relative shrink-0">
            <button
              id="header-org-selector-btn"
              type="button"
              onClick={() => {
                setTenantDropdownOpen(!tenantDropdownOpen);
                setRoleDropdownOpen(false);
                setShowNotifications(false);
              }}
              title={currentTenant ? `${currentTenant.name} (${currentTenant.industryType})` : 'SKANDA Global Operations Ltd'}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 h-8 rounded-lg border text-xs font-semibold transition max-w-[110px] sm:max-w-[140px] xl:max-w-[160px] min-w-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate text-xs font-semibold">
                {currentTenant ? currentTenant.name.replace(' Operations Ltd', '').replace(' Solutions Ltd', '').replace(' Global Holdings Ltd', '') : 'SKANDA Global'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Tenant Selection Dropdown */}
            {tenantDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl py-1 z-50 animate-in fade-in-50 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}>
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Search organization..."
                    value={tenantSearchQuery}
                    onChange={e => setTenantSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      setShowAddOrgModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTenants.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No organizations found
                    </div>
                  ) : (
                    filteredTenants.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setTenantDropdownOpen(false);
                          showToast({ title: `Switched to ${t.name}`, type: 'success' });
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition flex items-center justify-between cursor-pointer ${
                          t.id === currentTenant?.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400'
                            : isLight
                            ? 'hover:bg-slate-50 text-slate-800'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-semibold">{t.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">{t.industryType}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-500 shrink-0">
                          {t.readinessScore || 85}%
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      setShowAddOrgModal(true);
                    }}
                    className="font-semibold text-indigo-500 hover:underline cursor-pointer"
                  >
                    + Register Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDemoTenants(prev => !prev)}
                    className="underline text-[11px] cursor-pointer"
                  >
                    {showDemoTenants ? 'Hide Demo Orgs' : 'Show Demo Orgs'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action CTA: Consolidated Audit Binder Package (ZIP) */}
          <button
            id="header-audit-binder-btn"
            type="button"
            onClick={() => setShowAuditBinderModal(true)}
            className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 py-1 h-8 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition shadow-xs hover:shadow-indigo-500/20 cursor-pointer shrink-0 whitespace-nowrap"
            title="Generate One-Click Consolidated Audit Binder (ZIP Evidence Dossier)"
          >
            <FolderArchive className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Audit Pack</span>
            <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-white/20 text-white font-bold shrink-0">
              ZIP
            </span>
          </button>

          {/* AI Copilot Quick Launch */}
          <button
            id="header-ai-copilot-btn"
            type="button"
            onClick={() => {
              if (onOpenAiCopilot) onOpenAiCopilot();
              window.dispatchEvent(new CustomEvent('open-skanda-copilot'));
            }}
            className={`p-1.5 h-8 w-8 rounded-lg border flex items-center justify-center relative transition cursor-pointer shrink-0 ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 border-slate-300'
                : 'text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
            title="Open Skanda GRC AI Copilot (⌘J)"
            aria-label="Open Skanda GRC AI Copilot"
          >
            <div className="relative">
              <SkandaGRCopilotIcon size={16} status="online" animate={false} />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-slate-900" />
            </div>
          </button>

          {/* Executive Pitch Deck */}
          <button
            id="header-pitch-deck-btn"
            type="button"
            onClick={() => {
              if (onOpenPresentation) onOpenPresentation();
              else window.dispatchEvent(new CustomEvent('open-skanda-presentation'));
            }}
            className={`hidden 2xl:flex p-1.5 h-8 w-8 rounded-lg border items-center justify-center transition cursor-pointer shrink-0 ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 border-slate-300'
                : 'text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
            title="Executive Presentation & Client Pitch Deck (PPTX / PDF)"
          >
            <Presentation className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <button
              id="header-notifications-btn"
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setTenantDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              className={`p-1.5 h-8 w-8 rounded-lg border relative flex items-center justify-center transition cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-slate-100 border-slate-300'
                  : 'text-slate-200 hover:bg-slate-800 border-slate-700'
              }`}
              title="Notifications & Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-rose-600 text-white font-mono text-[8.5px] font-bold flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                12
              </span>
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in-50 duration-150 border ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider">Compliance Alerts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                    12 Active
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => {
                      setActiveModule('findings_capa');
                      setShowNotifications(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isLight ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70' : 'bg-rose-950/30 border-rose-900 hover:bg-rose-950/50'
                    }`}
                  >
                    <p className="font-bold text-rose-600 dark:text-rose-400">3 Overdue Evidence Items</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Quarterly Access Review requires lead auditor sign-off</p>
                  </div>
                  <div
                    onClick={() => {
                      setActiveModule('vendors');
                      setShowNotifications(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isLight ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70' : 'bg-amber-950/30 border-amber-900 hover:bg-amber-950/50'
                    }`}
                  >
                    <p className="font-bold text-amber-600 dark:text-amber-400">Supplier Security Assessment</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Critical cloud vendor SOC 2 assessment expiring in 14 days</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Trust Center Button */}
          <button
            id="header-trust-center-btn"
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-skanda-trust-center'));
            }}
            className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 h-8 rounded-lg border text-xs font-semibold transition cursor-pointer shrink-0 ${
              isLight
                ? 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-300'
                : 'text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-700/50'
            }`}
            title="Customer Trust Center: Security, DPDP & ISO Compliance Posture"
            aria-label="Customer Trust Center"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold">Trust Center</span>
          </button>

          {/* Help & Guide Button */}
          <button
            id="header-help-guide-btn"
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-skanda-welcome-guide'));
            }}
            className={`hidden 2xl:flex p-1.5 h-8 w-8 rounded-lg border items-center justify-center transition cursor-pointer shrink-0 ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 border-slate-300'
                : 'text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
            title="Help, User Guides & Architecture"
            aria-label="Help, User Guides & Architecture"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
          </button>

          {/* Theme Switcher */}
          <div className="shrink-0">
            <ThemeSwitcher variant="compact" />
          </div>

          {/* Font & Contrast Readability */}
          <div className="hidden 2xl:block shrink-0">
            <FontReadabilityMenu />
          </div>

          {/* User Profile Avatar & Role Menu */}
          <div className="relative shrink-0">
            <div
              id="header-user-profile-btn"
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setTenantDropdownOpen(false);
                setShowNotifications(false);
              }}
              className={`flex items-center space-x-1.5 pl-2 border-l h-8 cursor-pointer transition select-none ${
                isLight ? 'border-slate-300' : 'border-slate-800'
              }`}
              title="Arjun Mehta • User Profile & Security"
              role="button"
              tabIndex={0}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-[11px] ring-2 ring-indigo-500/30 shadow-xs shrink-0">
                AM
              </div>
              <div className="hidden 2xl:block text-left min-w-0 pr-1">
                <div className="text-xs font-bold leading-tight truncate">
                  Arjun Mehta
                </div>
                <div className="text-[9.5px] text-slate-400 font-medium leading-none truncate mt-0.5">
                  {currentRole === 'COMPANY_ADMIN' ? 'Chief InfoSec Officer' : currentRole.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </div>

            {/* Profile & Security Drawer */}
            {roleDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in-50 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}>
                {/* Header Profile Info */}
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">Arjun Mehta</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">arjun.mehta@acme-enterprises.com</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold">
                    {currentRole}
                  </span>
                </div>

                {/* System Trust & Session Security Badges */}
                <div className="py-3 border-b border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Zero-Trust Session Posture
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Protected Auth • Authenticated via MFA</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Protocol: TLS 1.3 Strict</span>
                    <span>Cluster: PROD-SG1</span>
                  </div>
                </div>

                {/* Switch Active Role */}
                <div className="py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Switch Active RBAC Persona
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { role: 'COMPANY_ADMIN', label: 'CISO Admin' },
                      { role: 'PLATFORM_AUDITOR', label: 'Lead Auditor' },
                      { role: 'INTERNAL_AUDITOR', label: 'Internal Auditor' },
                      { role: 'EMPLOYEE', label: 'Contributor' }
                    ].map(r => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role as UserRole);
                          setRoleDropdownOpen(false);
                          showToast({ title: `Switched role to ${r.label}`, type: 'success' });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer border ${
                          currentRole === r.role
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : isLight
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setRoleDropdownOpen(false);
                      showToast({ title: 'Signed out successfully', type: 'info' });
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Enterprise Modals */}
      <EnterpriseRealTimeHUDDrawer
        isOpen={showRealTimeHUD}
        onClose={() => setShowRealTimeHUD(false)}
      />

      <UnifiedAuditBinderModal
        isOpen={showAuditBinderModal}
        onClose={() => setShowAuditBinderModal(false)}
      />

      {showAddOrgModal && (
        <AddOrganizationModal
          isOpen={showAddOrgModal}
          onClose={() => setShowAddOrgModal(false)}
          onOrganizationCreated={() => {
            setShowAddOrgModal(false);
            showToast({ title: 'New Organization Created Successfully', type: 'success' });
          }}
        />
      )}
    </header>
  );
};
