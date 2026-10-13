/**
 * SKANDA Enterprise GRC Design System Tokens
 * Single Source of Truth for Layout, Spacing, Typography, Radii, Shadows, Elevation,
 * Buttons, KPI Cards, and Responsive Grid Architecture.
 */

export const DESIGN_TOKENS = {
  // Brand & Master Color Palette (Calm, Precision-Engineered Enterprise)
  colors: {
    brand: {
      primary: '#0F2747',       // Deep Executive Navy
      primaryHover: '#173A63',
      secondary: '#1E293B',     // Dark Slate
      accent: '#2563EB',        // Precision Royal Blue
      accentHover: '#1D4ED8',
      subtle: '#F1F5F9',
    },
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#0B0F19',
    },
    semantic: {
      success: {
        bgLight: '#ECFDF5',
        textLight: '#065F46',
        borderLight: '#A7F3D0',
        bgDark: '#064E3B40',
        textDark: '#34D399',
        borderDark: '#05966960',
        solid: '#059669',
      },
      warning: {
        bgLight: '#FFFBEB',
        textLight: '#92400E',
        borderLight: '#FDE68A',
        bgDark: '#78350F30',
        textDark: '#FBBF24',
        borderDark: '#D9770660',
        solid: '#D97706',
      },
      danger: {
        bgLight: '#FEF2F2',
        textLight: '#991B1B',
        borderLight: '#FECACA',
        bgDark: '#7F1D1D30',
        textDark: '#F87171',
        borderDark: '#DC262660',
        solid: '#DC2626',
      },
      info: {
        bgLight: '#EFF6FF',
        textLight: '#1E40AF',
        borderLight: '#BFDBFE',
        bgDark: '#1E3A8A30',
        textDark: '#60A5FA',
        borderDark: '#2563EB60',
        solid: '#2563EB',
      },
    },
  },

  // Spacing Scale (Strict 4px Grid - High-Density Enterprise)
  spacing: {
    0: '0px',
    1: '3px',    // micro gaps, icons
    2: '6px',    // tag/badge padding, compact gaps
    3: '10px',   // card inner header margins
    4: '12px',   // standard card padding, component gaps
    5: '16px',   // comfortable card padding
    6: '20px',   // section headers, standard grid gap
    8: '24px',   // major section gaps, page container padding
    10: '32px',  // large layout dividers
    12: '40px',  // empty state vertical padding
    16: '48px',  // top level page clearance
  },

  // Component Heights (Zero Arbitrary Heights - Compact 100% Zoom Fit)
  heights: {
    header: '54px',
    topBanner: '38px',
    buttonSm: '28px',
    buttonMd: '32px',
    buttonLg: '36px',
    buttonXl: '40px',
    inputSm: '28px',
    inputMd: '32px',
    inputLg: '36px',
    inputEnterprise: '42px',
    kpiCardMin: '104px',
    actionCardMin: '160px',
    tableRow: '38px',
    tableHeader: '32px',
    sidebarWidth: '240px',
    sidebarCollapsedWidth: '64px',
    drawerWidth: '520px',
  },

  // Enterprise SaaS Input Design Tokens (Strict System Contract)
  input: {
    height: '42px',
    radius: '10px',
    paddingX: '14px',
    iconSize: 17,
    iconGap: '10px',
    border: 'var(--input-border, #E2E8F0)',
    borderFocus: 'var(--input-border-focus, #2563EB)',
    focusRing: 'var(--input-focus-ring, rgba(37, 99, 235, 0.15))',
    bg: 'var(--input-bg, #FFFFFF)',
    text: 'var(--input-text, #0F172A)',
    placeholder: 'var(--input-placeholder, #94A3B8)',
  },

  // Standard Border Radii (Calm, Precision Enterprise)
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '14px',
    pill: '9999px',
  },

  // Standard Shadows (Subtle, Anti-AI Glow)
  shadows: {
    none: 'none',
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
    elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    modal: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
  },

  // Typography Scale (Inter / Plus Jakarta Sans)
  typography: {
    display: {
      fontSize: '1.5rem',       // 21px - 24px
      lineHeight: '1.875rem',   // 26px - 30px
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    pageTitle: {
      fontSize: '1.25rem',      // 17.5px - 20px
      lineHeight: '1.625rem',   // 22px - 26px
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    sectionTitle: {
      fontSize: '1rem',         // 14px - 16px
      lineHeight: '1.375rem',   // 19px - 22px
      fontWeight: '600',
      letterSpacing: '-0.015em',
    },
    cardTitle: {
      fontSize: '0.8125rem',    // 11.5px - 13px
      lineHeight: '1.125rem',   // 16px - 18px
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    body: {
      fontSize: '0.8125rem',    // 11.5px - 13px
      lineHeight: '1.25rem',    // 17px - 20px
      fontWeight: '400',
    },
    bodyMedium: {
      fontSize: '0.8125rem',    // 11.5px - 13px
      lineHeight: '1.25rem',    // 17px - 20px
      fontWeight: '500',
    },
    small: {
      fontSize: '0.75rem',      // 10.5px - 12px
      lineHeight: '1rem',       // 14px - 16px
      fontWeight: '400',
    },
    smallMedium: {
      fontSize: '0.75rem',      // 10.5px - 12px
      lineHeight: '1rem',       // 14px - 16px
      fontWeight: '500',
    },
    caption: {
      fontSize: '0.6875rem',    // 9.5px - 11px
      lineHeight: '0.875rem',   // 12px - 14px
      fontWeight: '500',
      letterSpacing: '0.025em',
    },
    mono: {
      fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
  },

  // Icon Standardization (Strictly 14, 16, 18, 20, 24px)
  iconSizes: {
    xs: 14, // inline tags & trailing carets
    sm: 16, // metadata & secondary actions
    md: 18, // buttons & interactive controls
    lg: 20, // card headers & badges
    xl: 24, // major navigation & section banners
  },

  // Z-Index Token Architecture (Strict Layering)
  zIndex: {
    base: 0,
    card: 1,
    sticky: 10,
    guidanceBar: 20,
    header: 30,
    dropdown: 40,
    popover: 50,
    drawerBackdrop: 60,
    drawer: 65,
    modalBackdrop: 70,
    modal: 75,
    toast: 90,
    tooltip: 100,
  },

  // Motion Design Tokens & Hierarchy
  motion: {
    durations: {
      instant: '80ms',
      fast: '140ms',       // Micro-interactions (hover, press, focus)
      standard: '200ms',   // Component state changes (tabs, accordions)
      medium: '280ms',     // Page transitions, modal & drawer slides
      slow: '450ms',       // Data count-up, complex chart progressive entrances
      dataViz: '800ms',    // KPI count-up, bar grow, radial progress fill
    },
    easings: {
      standard: 'cubic-bezier(0.16, 1, 0.3, 1)',   // Ultra-smooth decelerate
      enter: 'cubic-bezier(0, 0, 0.2, 1)',         // Decelerate curve
      exit: 'cubic-bezier(0.4, 0, 1, 1)',          // Accelerate curve
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',       // Swift micro-transitions
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Subtle tactile rebound (buttons only)
    },
    hover: {
      cardTranslateY: '-2px',
      buttonTranslateY: '-1px',
      pressTranslateY: '1px',
    }
  },

  // Visual Depth & Elevation Architecture
  depth: {
    level0: {
      name: 'Page Background',
      bgLight: '#F8FAFC',
      bgDark: '#0B0F19',
      border: 'transparent',
      shadow: 'none'
    },
    level1: {
      name: 'Standard Card Surface',
      bgLight: '#FFFFFF',
      bgDark: '#0F172A',
      borderLight: '#E2E8F0',
      borderDark: '#1E293B',
      shadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)'
    },
    level2: {
      name: 'Elevated Card / Dropdown',
      bgLight: '#FFFFFF',
      bgDark: '#131D31',
      borderLight: '#CBD5E1',
      borderDark: '#334155',
      shadow: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)'
    },
    level3: {
      name: 'Modal / Drawer Dialog',
      bgLight: '#FFFFFF',
      bgDark: '#0F172A',
      borderLight: '#E2E8F0',
      borderDark: '#1E293B',
      shadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.1)'
    },
    level4: {
      name: 'Critical Alert Overlay',
      bgLight: '#FFFFFF',
      bgDark: '#0B0F19',
      borderLight: '#DC2626',
      borderDark: '#EF4444',
      shadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)'
    }
  },

  // Grid Layout Breakpoint Rules
  grid: {
    pageMaxWidth: '1600px',
    pagePadding: 'px-4 sm:px-6 lg:px-8',
    sectionGap: 'space-y-6',
    cardGap: 'gap-4 sm:gap-5 lg:gap-6',
    // 12-column desktop breakdowns
    cols12: 'grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch',
    cols2: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-stretch',
  }
} as const;

export default DESIGN_TOKENS;
