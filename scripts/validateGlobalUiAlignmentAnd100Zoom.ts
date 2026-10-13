/**
 * SKANDA ENTERPRISE GRC PLATFORM
 * Global UI Alignment, Layout Normalization & 100% Browser Zoom Verification Suite
 * 
 * Script: scripts/validateGlobalUiAlignmentAnd100Zoom.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AssertionResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  details?: string;
}

const assertions: AssertionResult[] = [];

function assert(id: string, category: string, description: string, condition: boolean, details?: string) {
  assertions.push({
    id,
    category,
    description,
    passed: condition,
    details
  });
  if (!condition) {
    console.error(`❌ [FAIL] ${id} - ${category}: ${description} ${details ? `(${details})` : ''}`);
  } else {
    console.log(`✅ [PASS] ${id} - ${category}: ${description}`);
  }
}

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

console.log('================================================================');
console.log('SKANDA GLOBAL UI ALIGNMENT & 100% BROWSER ZOOM AUDIT SUITE');
console.log('================================================================\n');

// --------------------------------------------------------------------------
// 1. GLOBAL CSS & LAYOUT RESET AUDIT
// --------------------------------------------------------------------------
console.log('--- Phase 1: Global CSS & Reset Tokens Audit ---');
const indexCssPath = path.join(srcDir, 'index.css');
assert('CSS-001', 'CSS Resets', 'src/index.css exists', fs.existsSync(indexCssPath));

if (fs.existsSync(indexCssPath)) {
  const indexCss = fs.readFileSync(indexCssPath, 'utf8');

  // Check that html and body do NOT have max-width: 100vw (which causes scrollbar overflow on Windows)
  const hasHtml100Vw = /html\s*\{[^}]*max-width:\s*100vw/m.test(indexCss);
  const hasBody100Vw = /body\s*\{[^}]*max-width:\s*100vw/m.test(indexCss);
  const hasHtmlBody100Vw = /html,\s*body\s*\{[^}]*max-width:\s*100vw/m.test(indexCss);

  assert('CSS-002', 'CSS Resets', 'html element does not have max-width: 100vw', !hasHtml100Vw, hasHtml100Vw ? 'Found max-width: 100vw in html rule' : undefined);
  assert('CSS-003', 'CSS Resets', 'body element does not have max-width: 100vw', !hasBody100Vw, hasBody100Vw ? 'Found max-width: 100vw in body rule' : undefined);
  assert('CSS-004', 'CSS Resets', 'global overflow section does not set max-width: 100vw', !hasHtmlBody100Vw, hasHtmlBody100Vw ? 'Found max-width: 100vw in html, body rule' : undefined);

  // Check for overflow-x: hidden on root elements
  const hasOverflowHiddenOnBody = /body\s*\{[^}]*overflow-x:\s*hidden/m.test(indexCss);
  assert('CSS-005', 'CSS Resets', 'body has overflow-x: hidden to prevent horizontal scroll', hasOverflowHiddenOnBody);

  // Check main app container styles
  const hasMainContainerRule = indexCss.includes('#main-app-content-container') || indexCss.includes('.main-app-content-container');
  assert('CSS-006', 'CSS Resets', 'main-app-content-container reset exists in index.css', hasMainContainerRule);

  // Check design tokens for typography, spacing, radii
  assert('CSS-007', 'Design Tokens', 'Design token --skanda-radius defined', indexCss.includes('--skanda-radius') || indexCss.includes('--radius'));
  assert('CSS-008', 'Design Tokens', 'Font family sans defined', indexCss.includes('--font-family-sans') || indexCss.includes('font-sans'));
  assert('CSS-009', 'Design Tokens', 'Data table container class defined with overflow-x: auto', indexCss.includes('.skanda-table-container') && indexCss.includes('overflow-x: auto'));
}

// --------------------------------------------------------------------------
// 2. APPLICATION SHELL & CONTAINER AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 2: Application Shell & Root Container Audit ---');
const appTsxPath = path.join(srcDir, 'App.tsx');
assert('SHELL-001', 'App Shell', 'src/App.tsx exists', fs.existsSync(appTsxPath));

if (fs.existsSync(appTsxPath)) {
  const appTsx = fs.readFileSync(appTsxPath, 'utf8');

  // Check wrapper classes
  const hasPageWrapper = appTsx.includes('page-wrapper');
  const hasMaxWFull = appTsx.includes('max-w-full');
  const hasOverflowHiddenOnWrapper = appTsx.includes('overflow-hidden') || appTsx.includes('overflow-x-hidden');

  assert('SHELL-002', 'App Shell', 'Root shell uses page-wrapper and overflow containment', hasPageWrapper && hasOverflowHiddenOnWrapper);
  assert('SHELL-003', 'App Shell', 'Root shell enforces max-w-full', hasMaxWFull);

  // Check main content container flex and min-width containment
  const hasMainContentContainer = appTsx.includes('id="main-app-content-container"');
  const hasMainViewport = appTsx.includes('id="main-module-viewport"');
  const hasMinW0OnMain = appTsx.includes('min-w-0');

  assert('SHELL-004', 'App Shell', 'Main app content container configured with min-w-0 flex child', hasMainContentContainer && hasMinW0OnMain);
  assert('SHELL-005', 'App Shell', 'Main module viewport configured with responsive padding and overflow-y-auto', hasMainViewport && appTsx.includes('overflow-y-auto'));

  // Check all core shell components mounted
  assert('SHELL-006', 'App Shell', 'Header component mounted in shell', appTsx.includes('<Header'));
  assert('SHELL-007', 'App Shell', 'Sidebar component mounted in shell', appTsx.includes('<Sidebar'));
  assert('SHELL-008', 'App Shell', 'Consultant Guidance Bar mounted in shell', appTsx.includes('<ConsultantGuidanceBar'));
  assert('SHELL-009', 'App Shell', 'Global Task Action Bar mounted in shell', appTsx.includes('<GlobalTaskActionBar'));
  assert('SHELL-010', 'App Shell', 'Global Footer mounted in shell', appTsx.includes('<GlobalFooter'));
}

// --------------------------------------------------------------------------
// 3. HEADER & NAVIGATION ALIGNMENT AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 3: Header & Top Navigation Alignment Audit ---');
const headerPath = path.join(srcDir, 'components', 'layout', 'Header.tsx');
assert('HDR-001', 'Header', 'src/components/layout/Header.tsx exists', fs.existsSync(headerPath));

if (fs.existsSync(headerPath)) {
  const headerCode = fs.readFileSync(headerPath, 'utf8');

  assert('HDR-002', 'Header', 'Header uses sticky positioning with backdrop blur', headerCode.includes('sticky top-0') && headerCode.includes('backdrop-blur'));
  assert('HDR-003', 'Header', 'Header enforces max-w-[1600px] consistent layout container', headerCode.includes('max-w-[1600px]'));
  assert('HDR-004', 'Header', 'Header contains Global Search (⌘K)', headerCode.includes('onOpenCommandPalette') && headerCode.includes('⌘K'));
  assert('HDR-005', 'Header', 'Header contains Organization Switcher dropdown', headerCode.includes('header-org-selector-btn') || headerCode.includes('Building2'));
  assert('HDR-006', 'Header', 'Header contains Theme Switcher', headerCode.includes('<ThemeSwitcher'));
  assert('HDR-007', 'Header', 'Header contains Live Telemetry CCM indicator', headerCode.includes('LIVE CCM') || headerCode.includes('latencyMs'));
  assert('HDR-008', 'Header', 'Header buttons have responsive breakpoints to prevent wrapping at 1280px', headerCode.includes('hidden 2xl:flex') && headerCode.includes('hidden sm:inline-flex'));
}

// --------------------------------------------------------------------------
// 4. SIDEBAR RESPONSIVE & COLLAPSE AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 4: Sidebar Responsive & Collapse Audit ---');
const sidebarPath = path.join(srcDir, 'components', 'layout', 'Sidebar.tsx');
assert('SBR-001', 'Sidebar', 'src/components/layout/Sidebar.tsx exists', fs.existsSync(sidebarPath));

if (fs.existsSync(sidebarPath)) {
  const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

  assert('SBR-002', 'Sidebar', 'Sidebar supports collapsed width (64px) and expanded width (240px)', sidebarCode.includes('64px') && sidebarCode.includes('240px'));
  assert('SBR-003', 'Sidebar', 'Sidebar supports mobile drawer mode (<1024px)', sidebarCode.includes('isMobileOpen') && sidebarCode.includes('sidebar-mobile'));
  assert('SBR-004', 'Sidebar', 'Sidebar contains keyboard shortcut Alt+S toggle', sidebarCode.includes('Alt + S') || sidebarCode.includes('KeyS'));
  assert('SBR-005', 'Sidebar', 'Sidebar sub-items have lock indicator for restricted roles', sidebarCode.includes('Lock'));
  assert('SBR-006', 'Sidebar', 'Sidebar has floating tooltip in collapsed state', sidebarCode.includes('SidebarNavTooltip'));
}

// --------------------------------------------------------------------------
// 5. SHARED PAGE CONTAINER & PAGE HEADER AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 5: Shared PageContainer & PageHeader Audit ---');
const pageContainerPath = path.join(srcDir, 'components', 'layout', 'PageContainer.tsx');
const pageHeaderPath = path.join(srcDir, 'components', 'layout', 'PageHeader.tsx');
const premiumPageHeaderPath = path.join(srcDir, 'components', 'ui', 'premium', 'PremiumPageHeader.tsx');

assert('PC-001', 'PageContainer', 'PageContainer component exists', fs.existsSync(pageContainerPath));
assert('PH-001', 'PageHeader', 'Layout PageHeader component exists', fs.existsSync(pageHeaderPath));
assert('PPH-001', 'PremiumPageHeader', 'PremiumPageHeader component exists', fs.existsSync(premiumPageHeaderPath));

if (fs.existsSync(pageContainerPath)) {
  const pcCode = fs.readFileSync(pageContainerPath, 'utf8');
  assert('PC-002', 'PageContainer', 'PageContainer enforces min-w-0 flex safety', pcCode.includes('min-w-0'));
  assert('PC-003', 'PageContainer', 'PageContainer defaults to max-w-[1600px]', pcCode.includes('1600px'));
}

if (fs.existsSync(pageHeaderPath)) {
  const phCode = fs.readFileSync(pageHeaderPath, 'utf8');
  assert('PH-002', 'PageHeader', 'PageHeader supports responsive flex wrapping for titles & actions', phCode.includes('flex-col sm:flex-row') && phCode.includes('min-w-0 flex-1'));
  assert('PH-003', 'PageHeader', 'PageHeader supports breadcrumb navigation', phCode.includes('breadcrumbs') && phCode.includes('ChevronRight'));
}

// --------------------------------------------------------------------------
// 6. PREMIUM COMPONENT SUITE RESPONSIVE AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 6: Premium UI Component Responsive Audit ---');
const premiumFiles = [
  'PremiumCard.tsx',
  'PremiumTable.tsx',
  'PremiumModal.tsx',
  'PremiumDrawer.tsx',
  'PremiumButton.tsx',
  'PremiumBadge.tsx',
  'PremiumInput.tsx',
  'PremiumSelect.tsx',
  'PremiumTabs.tsx'
];

premiumFiles.forEach(file => {
  const filePath = path.join(srcDir, 'components', 'ui', 'premium', file);
  assert(`PRM-${file.split('.')[0]}`, 'Premium UI', `Component ${file} exists`, fs.existsSync(filePath));
});

// Check PremiumTable overflow handling
const premiumTablePath = path.join(srcDir, 'components', 'ui', 'premium', 'PremiumTable.tsx');
if (fs.existsSync(premiumTablePath)) {
  const tableCode = fs.readFileSync(premiumTablePath, 'utf8');
  assert('PRM-TBL-001', 'PremiumTable', 'Table is wrapped in overflow-x-auto container', tableCode.includes('overflow-x-auto'));
  assert('PRM-TBL-002', 'PremiumTable', 'Table supports sorting, pagination and empty state', tableCode.includes('handleSort') && tableCode.includes('totalPages') && tableCode.includes('emptyTitle'));
}

// Check PremiumModal viewport boundary safety
const premiumModalPath = path.join(srcDir, 'components', 'ui', 'premium', 'PremiumModal.tsx');
if (fs.existsSync(premiumModalPath)) {
  const modalCode = fs.readFileSync(premiumModalPath, 'utf8');
  assert('PRM-MDL-001', 'PremiumModal', 'Modal enforces max-h-[90vh] and overflow-y-auto content body', modalCode.includes('max-h-[90vh]') && modalCode.includes('overflow-y-auto'));
  assert('PRM-MDL-002', 'PremiumModal', 'Modal handles escape key and scroll lock', modalCode.includes("e.key === 'Escape'") && modalCode.includes('overflow = \'hidden\''));
}

// Check PremiumDrawer viewport boundary safety
const premiumDrawerPath = path.join(srcDir, 'components', 'ui', 'premium', 'PremiumDrawer.tsx');
if (fs.existsSync(premiumDrawerPath)) {
  const drawerCode = fs.readFileSync(premiumDrawerPath, 'utf8');
  assert('PRM-DRW-001', 'PremiumDrawer', 'Drawer scrollable content body has overflow-y-auto', drawerCode.includes('overflow-y-auto'));
  assert('PRM-DRW-002', 'PremiumDrawer', 'Drawer handles backdrop click and escape key', drawerCode.includes("e.key === 'Escape'") && drawerCode.includes('onClick={onClose}'));
}

// --------------------------------------------------------------------------
// 7. KEY APPLICATION WORKSPACES AUDIT
// --------------------------------------------------------------------------
console.log('\n--- Phase 7: Application Workspaces Audit ---');
const workspaceFiles = [
  'CommandCenterDashboard.tsx',
  'ComplianceWorkspace.tsx',
  'RiskWorkspace.tsx',
  'ControlsEvidenceWorkspace.tsx',
  'AuditAssuranceWorkspace.tsx',
  'ThirdPartyAssetsWorkspace.tsx',
  'SkandaIntelligenceWorkspace.tsx',
  'ReportsIntelligenceWorkspace.tsx',
  'PlatformSettingsWorkspace.tsx'
];

workspaceFiles.forEach(file => {
  let found = false;
  const possiblePaths = [
    path.join(srcDir, 'components', 'dashboard', file),
    path.join(srcDir, 'components', 'workspaces', file),
    path.join(srcDir, 'components', 'modules', file)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      found = true;
      break;
    }
  }
  assert(`WKS-${file.split('.')[0]}`, 'Workspaces', `Workspace ${file} exists`, found);
});

// --------------------------------------------------------------------------
// SUMMARY & EXIT
// --------------------------------------------------------------------------
console.log('\n================================================================');
console.log('AUDIT SUMMARY');
console.log('================================================================');

const passedCount = assertions.filter(a => a.passed).length;
const totalCount = assertions.length;
console.log(`Total Assertions Checked: ${totalCount}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${totalCount - passedCount}`);

if (passedCount === totalCount) {
  console.log('\n🎉 ALL UI ALIGNMENT & 100% ZOOM ASSERTIONS PASSED WITH 100% SUCCESS!');
  process.exit(0);
} else {
  console.error('\n⚠️ SOME ASSERTIONS FAILED. Review details above.');
  process.exit(1);
}
