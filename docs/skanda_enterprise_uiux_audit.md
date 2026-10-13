# SKANDA Enterprise UI/UX Audit (measured)

Generated: 2026-10-12T18:56:53.003Z

Source files scanned: **808** (170 contain `dark:` conditionals).

## 1. Design-token coverage

| Metric | Value |
| --- | --- |
| Arbitrary hex colour utilities (`bg-[#0F172A]`) | **2541** in **69** files |
| Colour class strings with no `dark:` counterpart | **33884** in **493** files |
| Dead colour utilities (used in source, absent from built CSS) | **16** distinct tokens, **90** occurrences |

Dead-utility check compared source against `dist/assets/index-D2bs8IEC.css` (5359 class selectors parsed).

### 1.1 Dead colour utilities (silent no-ops)

| Utility | Occurrences | Files |
| --- | --- | --- |
| `hover:bg-slate-750` | 25 | 16 |
| `border-slate-850` | 17 | 6 |
| `border-slate-750` | 9 | 6 |
| `bg-slate-850` | 8 | 4 |
| `hover:bg-slate-850/50` | 6 | 1 |
| `dark:hover:bg-slate-750` | 5 | 2 |
| `hover:bg-slate-850` | 4 | 4 |
| `via-slate-850` | 3 | 3 |
| `dark:bg-slate-850` | 2 | 1 |
| `hover:bg-slate-850/60` | 2 | 2 |
| `to-slate-850` | 2 | 2 |
| `bg-slate-850/80` | 2 | 2 |
| `border-indigo-850` | 2 | 1 |
| `bg-slate-850/60` | 1 | 1 |
| `hover:bg-slate-850/40` | 1 | 1 |
| `hover:bg-slate-750/50` | 1 | 1 |

### 1.2 Worst files for arbitrary hex colours

| File | Occurrences |
| --- | --- |
| `src/components/questionnaire/SecurityQuestionnaireWorkspace.tsx` | 522 |
| `src/components/mas/workflow/MASComplianceWorkflowModule.tsx` | 283 |
| `src/components/live-monitoring/LiveMonitoringWorkspace.tsx` | 184 |
| `src/components/dashboard/DashboardHeader.tsx` | 129 |
| `src/components/dashboard/ISO27001ControlsBreakdownModal.tsx` | 117 |
| `src/components/dashboard/ComplianceMaturityTrendWidget.tsx` | 113 |
| `src/components/compliance/ControlLineageExplorerPanel.tsx` | 110 |
| `src/components/dashboard/CommandCenterKeyMetrics.tsx` | 102 |
| `src/components/analytics/ComplianceMaturityScorecard.tsx` | 96 |
| `src/components/ui/Badge.tsx` | 80 |
| `src/components/dashboard/FrameworkSelector.tsx` | 56 |
| `src/components/dashboard/DashboardPriorityBar.tsx` | 55 |
| `src/components/compliance/ISO27001ControlDrillDownDetailView.tsx` | 52 |
| `src/components/common/PageHeader.tsx` | 51 |
| `src/components/layout/Sidebar.tsx` | 47 |
| `src/components/dashboard/DraggableDashboardCard.tsx` | 38 |
| `src/components/compliance/PolicyGenerator.tsx` | 34 |
| `src/components/dashboard/DraggableMetricWidget.tsx` | 33 |
| `src/components/dashboard/ComplianceOverview.tsx` | 31 |
| `src/components/common/Modal.tsx` | 30 |

### 1.3 Worst files for colour strings without a `dark:` counterpart

- `src/components/mas/ComplianceGapVisualization.tsx` — 679
  - `inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-e`
  - `w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0`
  - `text-emerald-400 shrink-0`
- `src/components/grc/OrganizationalDiscoveryWorkspace.tsx` — 404
  - `p-6 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl shadow-`
  - `absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none`
  - `p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-inner`
- `src/components/modules/ContinuousComplianceModule.tsx` — 363
  - `fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 shadow-2xl `
  - `w-5 h-5 text-emerald-400 shrink-0`
  - `p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-`
- `src/components/modules/EvidenceCentreModule.tsx` — 329
  - `p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justi`
  - `w-4 h-4 text-emerald-400 shrink-0`
  - `text-emerald-400/70 hover:text-emerald-300 text-xs px-2 py-0.5 rounded`
- `src/components/modules/LiveTelemetryStreamModule.tsx` — 324
  - `inline-flex items-center space-x-1.5 font-bold font-mono rounded-lg border transition-all bg-emerald-500/15 te`
  - `animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`
  - `relative inline-flex rounded-full h-2 w-2 bg-emerald-400`
- `src/components/modules/ReportsAnalyticsModule.tsx` — 315
  - `bg-slate-900/98 backdrop-blur-md border border-slate-700/90 shadow-2xl rounded-2xl p-4 max-w-sm sm:max-w-md w-`
  - `flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5`
  - `text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800`
- `src/components/policies/PolicyContextualizer.tsx` — 315
  - `space-y-6 text-slate-800`
  - `p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3`
  - `w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 sh`
- `src/components/grc/PolicyGovernanceWorkspace.tsx` — 305
  - `min-h-screen bg-slate-900 text-slate-100 p-6`
  - `w-5 h-5 text-emerald-400`
  - `w-5 h-5 text-rose-400`
- `src/components/compliance/PolicyGenerator.tsx` — 282
  - `bg-blue-500/10 text-blue-400 border-blue-500/20`
  - `bg-amber-500/10 text-amber-400 border-amber-500/20`
  - `bg-purple-500/10 text-purple-400 border-purple-500/20`
- `src/components/soa/ISO27001ReadinessScorecard.tsx` — 280
  - `rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-0`
  - `p-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800`
  - `text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950 border bord`

## 2. Contrast (WCAG 2.2 AA)

### Light mode — 0 hard failure(s), 3 large-text-only pair(s), 16 pairs evaluated

Pairs marked EXEMPT are disabled-control text, which SC 1.4.3 excludes from the contrast minimum.

| Pair | Ratio | AA text (4.5) | AA large / UI (3.0) |
| --- | --- | --- | --- |
| Primary text on app canvas | 17.06:1 | PASS | PASS |
| Primary text on surface | 17.85:1 | PASS | PASS |
| Primary text on card | 17.85:1 | PASS | PASS |
| Secondary text on surface | 7.58:1 | PASS | PASS |
| Muted text on surface | 7.58:1 | PASS | PASS |
| Tertiary text on card | 4.76:1 | PASS | PASS |
| Disabled text on card | 2.56:1 | EXEMPT | EXEMPT |
| Accent on surface | 5.17:1 | PASS | PASS |
| Accent on app canvas | 4.94:1 | PASS | PASS |
| Success on card | 3.77:1 | FAIL | PASS |
| Warning on card | 3.19:1 | FAIL | PASS |
| Danger on card | 4.83:1 | PASS | PASS |
| Critical on card | 6.47:1 | PASS | PASS |
| Info on card | 4.10:1 | FAIL | PASS |
| Sidebar text on sidebar | 17.85:1 | PASS | PASS |
| Sidebar muted on sidebar | 4.76:1 | PASS | PASS |

### Dark mode — 0 hard failure(s), 0 large-text-only pair(s), 16 pairs evaluated

Pairs marked EXEMPT are disabled-control text, which SC 1.4.3 excludes from the contrast minimum.

| Pair | Ratio | AA text (4.5) | AA large / UI (3.0) |
| --- | --- | --- | --- |
| Primary text on app canvas | 17.89:1 | PASS | PASS |
| Primary text on surface | 15.58:1 | PASS | PASS |
| Primary text on card | 15.58:1 | PASS | PASS |
| Secondary text on surface | 10.98:1 | PASS | PASS |
| Muted text on surface | 10.98:1 | PASS | PASS |
| Tertiary text on card | 6.36:1 | PASS | PASS |
| Disabled text on card | 3.42:1 | EXEMPT | EXEMPT |
| Accent on surface | 6.41:1 | PASS | PASS |
| Accent on app canvas | 7.36:1 | PASS | PASS |
| Success on card | 8.48:1 | PASS | PASS |
| Warning on card | 7.59:1 | PASS | PASS |
| Danger on card | 5.89:1 | PASS | PASS |
| Critical on card | 6.06:1 | PASS | PASS |
| Info on card | 7.61:1 | PASS | PASS |
| Sidebar text on sidebar | 17.06:1 | PASS | PASS |
| Sidebar muted on sidebar | 6.96:1 | PASS | PASS |

## 3. Theme infrastructure

| Check | Result |
| --- | --- |
| foucGuardInlineScript | PRESENT |
| persistedKey | PRESENT |
| systemModeSupported | PRESENT |
| osChangeListener | PRESENT |
| crossTabSync | PRESENT |
| transitionSuppression | PRESENT |
| switcherHasRadiogroup | PRESENT |
| switcherHasVisibleLabels | PRESENT |
| prefersReducedMotion | PRESENT |
