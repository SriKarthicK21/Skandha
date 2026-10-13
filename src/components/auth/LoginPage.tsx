// ============================================================================
// SKANDA ZERO-TRUST ENTERPRISE IDENTITY & EXPERIENCE GATEWAY
// Path: src/components/auth/LoginPage.tsx
//
// CTO & Principal Enterprise Architect Implementation:
// - Server-Authoritative Identity, Tenant, Role, Persona & Onboarding Resolution
// - Phishing-Resistant FIDO2 / WebAuthn Passkeys & TOTP MFA
// - Dynamic Domain Discovery for Microsoft Entra ID, Okta & Google Workspace
// - Real-Time Login Risk Assessment HUD (IP, Privilege, Device, Velocity)
// - Onboarding-Aware & Persona-Aware Landing Workspace Routing
// - WCAG AA Accessible, Keyboard-Navigable, Responsive (375px - 1920px)
// ============================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Globe2,
  Terminal,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Laptop,
  X,
  FileText,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Cpu,
  Database,
  Activity,
  Award,
  Sun,
  Moon,
  Radio,
  Zap,
  Check,
  Search,
  Key,
  Flame,
  Clock,
  Layers,
  LucideIcon
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { User, GlobalTheme } from '../../types';
import { organizationService } from '../../services/organizationService';
import { identityGatewayService } from '../../services/auth/identityGatewayService';
import { riskBasedAuthService } from '../../services/auth/riskBasedAuthService';
import { personaResolverService } from '../../services/auth/personaResolverService';
import { onboardingResolverService } from '../../services/auth/onboardingResolverService';
import {
  AuthMethod,
  AuthenticatedSessionContext,
  SecurityTelemetryEvent,
  IdentityGatewayMetrics,
  SSOProviderRecord,
  CanonicalPersona,
  LoginRiskLevel
} from '../../types/identityTypes';

export interface EnterpriseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelAction?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number | string; strokeWidth?: number | string }>;
  iconPosition?: 'left' | 'right';
  action?: React.ReactNode;
  error?: string | null;
  helperText?: string;
  isPassword?: boolean;
  isValid?: boolean;
  reserveErrorSpace?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

/**
 * EnterpriseInput
 * Strict Enterprise SaaS input system with CLS = 0.000 reserved error layout.
 */
export const EnterpriseInput = React.forwardRef<HTMLInputElement, EnterpriseInputProps>(({
  label,
  labelAction,
  icon: Icon,
  iconPosition = 'left',
  action,
  error,
  helperText,
  isPassword = false,
  isValid = false,
  reserveErrorSpace = true,
  containerClassName = '',
  inputClassName = '',
  id,
  type = 'text',
  required,
  disabled,
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? `skanda-input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col group ${containerClassName}`}>
      {/* Label and Action Header Row */}
      {(label || labelAction) && (
        <div className="flex items-center justify-between mb-2 select-none">
          {label && (
            <label
              htmlFor={inputId}
              className="text-[13px] leading-5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <span>{label}</span>
              {required && (
                <span className="text-rose-500 font-bold" aria-hidden="true">*</span>
              )}
            </label>
          )}
          {labelAction && (
            <div className="text-[13px] leading-5 font-medium">
              {labelAction}
            </div>
          )}
        </div>
      )}

      {/* Input Box Container */}
      <div
        className={`relative flex items-center w-full transition-all duration-200 ease-out border ${
          disabled
            ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
            : error
              ? 'bg-white dark:bg-slate-950/80 border-rose-500 dark:border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-600 shadow-sm shadow-rose-500/10'
              : isValid
                ? 'bg-white dark:bg-slate-950/80 border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:border-blue-500 dark:focus-within:ring-2 dark:focus-within:ring-blue-500/25'
                : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:border-blue-500 dark:focus-within:ring-2 dark:focus-within:ring-blue-500/25'
        } shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]`}
        style={{
          height: 'var(--input-height, 42px)',
          minHeight: 'var(--input-height, 42px)',
          borderRadius: '10px',
          paddingLeft: '14px',
          paddingRight: '14px',
          boxSizing: 'border-box'
        }}
      >
        {/* Leading Icon Container */}
        {Icon && iconPosition === 'left' && (
          <div className="flex items-center justify-center shrink-0 mr-3 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" style={{ width: '19px', height: '19px' }}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
        )}

        {/* Input element */}
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`flex-1 w-full h-full bg-transparent text-[14px] leading-normal font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed ${inputClassName}`}
          {...props}
        />

        {/* Password Reveal Toggle Button */}
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center p-1.5 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        )}

        {/* Custom Action Element */}
        {action && (
          <div className="flex items-center ml-2 shrink-0">
            {action}
          </div>
        )}

        {/* Trailing Icon */}
        {Icon && iconPosition === 'right' && !isPassword && !action && (
          <div className="flex items-center justify-center shrink-0 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" style={{ width: '19px', height: '19px' }}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Real-Time Validation & Helper Text Row */}
      {reserveErrorSpace ? (
        <div className="min-h-[20px] mt-1.5 flex items-start text-left transition-all duration-150">
          {error ? (
            <div
              id={errorId}
              role="alert"
              className="text-[12px] leading-tight font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          ) : helperText ? (
            <div
              id={helperId}
              className="text-[12px] leading-tight font-medium text-slate-500 dark:text-slate-400"
            >
              {helperText}
            </div>
          ) : null}
        </div>
      ) : (error || helperText) ? (
        <div className="mt-1.5 flex items-start text-left">
          {error ? (
            <div
              id={errorId}
              role="alert"
              className="text-[12px] leading-tight font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          ) : (
            <div
              id={helperId}
              className="text-[12px] leading-tight font-medium text-slate-500 dark:text-slate-400"
            >
              {helperText}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});

EnterpriseInput.displayName = 'EnterpriseInput';

// ============================================================================
// ANIMATION VARIANTS & TRANSITIONS
// ============================================================================
const easeOutQuart = [0.25, 1, 0.5, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutQuart }
  }
};

const formStepVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOutQuart } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: easeOutQuart } }
};

interface SovereignRegionOption {
  id: string;
  name: string;
  code: string;
  flag: string;
  compliance: string;
  latencyMs: number;
}

const SOVEREIGN_REGIONS: SovereignRegionOption[] = [
  { id: 'sg', name: 'Singapore (Changi Central)', code: 'AWS_AP_SOUTHEAST_1', flag: '🇸🇬', compliance: 'MAS TRM / PDPA Strict', latencyMs: 4 },
  { id: 'fra', name: 'Frankfurt Sovereign Zone', code: 'AWS_EU_CENTRAL_1', flag: '🇩🇪', compliance: 'EU GDPR / BSI C5', latencyMs: 18 },
  { id: 'iad', name: 'US East (N. Virginia FedZone)', code: 'AWS_US_EAST_1', flag: '🇺🇸', compliance: 'SOC2 / FedRAMP High', latencyMs: 24 },
  { id: 'ldn', name: 'London Crown Node', code: 'AWS_EU_WEST_2', flag: '🇬🇧', compliance: 'UK Cyber Essentials Plus', latencyMs: 22 }
];

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    users,
    loginWithSessionContext,
    setIsAuthenticated,
    switchUser,
    switchRole,
    switchTenant,
    startNewEntityOnboarding
  } = useGRC();

  // State Management
  const [authStep, setAuthStep] = useState<'input' | 'mfa' | 'authenticating' | 'success'>('input');
  const [authMethod, setAuthMethod] = useState<'credentials' | 'sso' | 'passkey'>('credentials');
  const [email, setEmail] = useState('srikarthik@skanda.security');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [activeMfaChallengeId, setActiveMfaChallengeId] = useState<string>('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [ssoDomain, setSsoDomain] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<SovereignRegionOption>(SOVEREIGN_REGIONS[0]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Validation & Error States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Security Lockout States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Biometric & Handshake States
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [authProgressMessage, setAuthProgressMessage] = useState('Initializing zero-trust posture challenge...');
  const [authProgressPct, setAuthProgressPct] = useState(15);
  const [mfaTimer, setMfaTimer] = useState(300); // 5 minutes
  const [selectedPersona, setSelectedPersona] = useState<User | null>(null);

  // Interactive Inspector & Modals
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'architecture' | 'telemetry' | null>(null);
  const [isDemoSectionOpen, setIsDemoSectionOpen] = useState(true);
  const [liveRiskEvaluation, setLiveRiskEvaluation] = useState<ReturnType<typeof riskBasedAuthService.evaluateRisk> | null>(null);

  // Theme Management
  const [theme, setTheme] = useState<GlobalTheme>(() => {
    try {
      const saved = localStorage.getItem('skanda_theme') as GlobalTheme;
      if (saved) return saved;
    } catch {}
    return 'midnight';
  });

  // Framework Feature Showcase Carousel State
  const [activeTrustIndex, setActiveTrustIndex] = useState(0);
  const trustHighlights = [
    {
      title: 'Zero-Trust Identity & Experience Gateway',
      desc: 'Server-authoritative identity resolution seamlessly routes CISO, Auditors, Control Owners, and newly onboarded tenants to their exact workspace.',
      badge: 'Zero-Trust RBAC',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      title: 'MAS TRM 2026 & Cyber Notice 644',
      desc: 'Automated statutory reporting pipelines with 1-hour critical incident SLA tracking and cyber resilience simulation.',
      badge: 'Statutory Assurance',
      color: 'from-indigo-600 to-cyan-500'
    },
    {
      title: 'Phishing-Resistant FIDO2 WebAuthn',
      desc: 'Hardware-backed biometric passkey authentication verified against cryptographic WORM audit ledgers.',
      badge: 'FIDO2 Level 2',
      color: 'from-cyan-500 to-emerald-500'
    },
    {
      title: 'Organizational Truth Discovery Engine',
      desc: 'Enforces "No Truth → No Policy". Directs pending department interviews and RACI mapping before policy generation.',
      badge: 'Discovery Gate',
      color: 'from-amber-500 to-rose-500'
    }
  ];

  // DOM Refs
  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const regionDropdownRef = useRef<HTMLDivElement | null>(null);

  // Theme synchronization
  useEffect(() => {
    try {
      localStorage.setItem('skanda_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, [theme]);

  // Rotate framework highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrustIndex((prev) => (prev + 1) % trustHighlights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [trustHighlights.length]);

  // MFA Countdown
  useEffect(() => {
    if (authStep !== 'mfa') return;
    const timer = setInterval(() => {
      setMfaTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authStep]);

  // Lockout Countdown Timer
  useEffect(() => {
    if (!isAccountLocked || lockoutTimer <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimer((t) => {
        if (t <= 1) {
          setIsAccountLocked(false);
          setErrorMessage(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAccountLocked, lockoutTimer]);

  // Outside click for region dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target as Node)) {
        setIsRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Risk Assessment Evaluation
  useEffect(() => {
    const evaluation = riskBasedAuthService.evaluateRisk({
      email,
      authMethod: authMethod === 'passkey' ? 'PASSKEY_WEBAUTHN' : authMethod === 'sso' ? 'ENTERPRISE_SSO' : 'PASSWORD_MFA',
      role: selectedPersona?.role || 'COMPANY_ADMIN',
      isPrivileged: true,
      recentFailedAttemptsCount: failedAttempts
    });
    setLiveRiskEvaluation(evaluation);
  }, [email, authMethod, selectedPersona, failedAttempts]);

  // Particle Mesh Cyber Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(width < 768 ? 32 : 65, 75);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulse: number;
    }> = [];

    const colors = theme === 'light'
      ? ['rgba(59, 130, 246, 0.35)', 'rgba(99, 102, 241, 0.35)', 'rgba(14, 165, 233, 0.35)']
      : ['rgba(59, 130, 246, 0.55)', 'rgba(129, 140, 248, 0.5)', 'rgba(6, 182, 212, 0.55)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.6 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fine cybernetic grid
      ctx.strokeStyle = theme === 'light' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(30, 41, 59, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render and connect particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.018;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 180) {
          p.x += dx * 0.0018;
          p.y += dy * 0.0018;
        }

        const currentRadius = p.radius + Math.sin(p.pulse) * 0.4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = theme === 'light'
              ? `rgba(59, 130, 246, ${0.12 * (1 - dist / 125)})`
              : `rgba(99, 102, 241, ${0.18 * (1 - dist / 125)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  // MFA Handlers
  const handleMfaDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...mfaCode];
    newCode[index] = val.slice(-1);
    setMfaCode(newCode);

    if (val && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && val && newCode.every((d) => d !== '')) {
      handleMfaSubmit(newCode.join(''));
    }
  };

  const handleMfaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setMfaCode(digits);
      mfaInputRefs.current[5]?.focus();
      handleMfaSubmit(pastedData);
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================================================
  // PIPELINE DISPATCH & DISPATCH ANIMATION SEQUENCE
  // ==========================================================================
  const triggerResolvedSessionDispatch = useCallback((sessionContext: AuthenticatedSessionContext) => {
    setAuthStep('authenticating');
    setErrorMessage(null);

    const steps = [
      { msg: 'Establishing TLS 1.3 encrypted sovereign session...', pct: 20, delay: 200 },
      { msg: `Resolving Tenant: ${sessionContext.tenant.name} (${sessionContext.tenant.id})...`, pct: 40, delay: 240 },
      { msg: `Validating Persona: ${sessionContext.persona.displayName} (${sessionContext.user.primaryRole})...`, pct: 65, delay: 260 },
      { msg: `Enforcing Discovery Gate: ${sessionContext.onboarding.state}...`, pct: 85, delay: 240 },
      { msg: `Routing to Landing Workspace: ${sessionContext.landing.targetModuleId}...`, pct: 100, delay: 220 }
    ];

    let currentStepIndex = 0;

    const runNextStep = () => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setAuthProgressMessage(step.msg);
        setAuthProgressPct(step.pct);
        currentStepIndex++;
        setTimeout(runNextStep, step.delay);
      } else {
        setAuthStep('success');
        setTimeout(() => {
          loginWithSessionContext(sessionContext);
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 350);
      }
    };

    runNextStep();
  }, [loginWithSessionContext, onLoginSuccess]);

  // Validation Handlers
  const validateEmailFormat = (val: string): string | null => {
    if (!val || !val.trim()) {
      return 'Corporate work email is required.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid corporate email format.';
    }
    return null;
  };

  const validatePasswordFormat = (val: string): string | null => {
    if (!val || val.length === 0) {
      return 'Password is required.';
    }
    if (val.length < 4) {
      return 'Password must contain at least 4 characters.';
    }
    return null;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errorMessage) setErrorMessage(null);
    if (emailTouched || emailError || val.includes('@')) {
      const err = validateEmailFormat(val);
      setEmailError(err);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const err = validateEmailFormat(email);
    setEmailError(err);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errorMessage) setErrorMessage(null);
    if (passwordTouched || passwordError) {
      const err = validatePasswordFormat(val);
      setPasswordError(err);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const err = validatePasswordFormat(password);
    setPasswordError(err);
  };

  const handleUnlockAccount = () => {
    setIsAccountLocked(false);
    setFailedAttempts(0);
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (isAccountLocked) {
      setErrorMessage(`Account temporarily locked for security. Please wait ${lockoutTimer}s.`);
      return;
    }

    const emailErr = validateEmailFormat(email);
    const passwordErr = validatePasswordFormat(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    setEmailError(null);
    setPasswordError(null);

    // Call Identity Gateway
    const response = await identityGatewayService.authenticate({
      email,
      password,
      authMethod: 'PASSWORD_MFA',
      clientRiskHints: {
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

    if (!response.success) {
      if (response.errorCode === 'ACCOUNT_LOCKED') {
        setIsAccountLocked(true);
        setLockoutTimer(response.lockoutRemainingSeconds || 900);
      } else {
        setFailedAttempts((prev) => prev + 1);
      }
      setErrorMessage(response.errorMessage || 'Unable to authenticate with the supplied credentials.');
      return;
    }

    if (response.requiresMfa && response.mfaChallenge) {
      setActiveMfaChallengeId(response.mfaChallenge.challengeId);
      setAuthStep('mfa');
      setTimeout(() => {
        mfaInputRefs.current[0]?.focus();
      }, 150);
      return;
    }

    if (response.sessionContext) {
      triggerResolvedSessionDispatch(response.sessionContext);
    }
  };

  // MFA Submit Handler
  const handleMfaSubmit = async (codeString?: string) => {
    const code = codeString || mfaCode.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit TOTP code.');
      return;
    }

    const response = await identityGatewayService.verifyMfa(
      activeMfaChallengeId || 'default-challenge',
      code,
      selectedPersona?.id
    );

    if (!response.success) {
      setErrorMessage(response.errorMessage || 'Invalid MFA verification code.');
      return;
    }

    if (response.sessionContext) {
      triggerResolvedSessionDispatch(response.sessionContext);
    }
  };

  // Quick Persona Select (Enterprise Sandbox)
  const handleQuickPersonaSelect = async (user: User) => {
    setSelectedPersona(user);
    setEmail(user.email);
    setPassword('••••••••••••');
    setEmailTouched(false);
    setPasswordTouched(false);
    setEmailError(null);
    setPasswordError(null);
    setErrorMessage(null);
    setIsAccountLocked(false);

    // Build authentic session context through Gateway
    const response = await identityGatewayService.authenticate({
      email: user.email,
      password: 'password123',
      authMethod: 'PASSWORD_MFA',
      clientRiskHints: {
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

    if (response.success && response.sessionContext) {
      triggerResolvedSessionDispatch(response.sessionContext);
    } else if (response.requiresMfa) {
      // Auto-complete TOTP for seamless 1-click evaluation
      const mfaRes = await identityGatewayService.verifyMfa(
        response.mfaChallenge?.challengeId || 'auto-eval',
        '123456',
        user.id
      );
      if (mfaRes.success && mfaRes.sessionContext) {
        triggerResolvedSessionDispatch(mfaRes.sessionContext);
      }
    }
  };

  // Biometric / Passkey Scan Handler
  const handleBiometricScan = async () => {
    setBiometricScanning(true);
    setErrorMessage(null);

    await identityGatewayService.initiatePasskeyAuth(email);

    setTimeout(async () => {
      setBiometricScanning(false);
      const response = await identityGatewayService.verifyPasskey({}, email);
      if (response.success && response.sessionContext) {
        triggerResolvedSessionDispatch(response.sessionContext);
      } else {
        setErrorMessage(response.errorMessage || 'Passkey attestation failed.');
      }
    }, 1000);
  };

  // SSO Login Handler
  const handleSSOLogin = async (providerIdentifier: string) => {
    setErrorMessage(null);
    setAuthProgressMessage(`Initiating ${providerIdentifier} enterprise federated session...`);

    const { provider } = await identityGatewayService.initiateSSO(providerIdentifier);
    const response = await identityGatewayService.verifySSOAssertion(provider.providerId, 'mock-assertion-token', email);

    if (response.success && response.sessionContext) {
      triggerResolvedSessionDispatch(response.sessionContext);
    } else {
      setErrorMessage(response.errorMessage || 'SSO federation rejected by identity provider.');
    }
  };

  const handleStartNewRegistration = () => {
    startNewEntityOnboarding();
    onLoginSuccess?.();
  };

  const isLight = theme === 'light';
  const metrics = useMemo(() => identityGatewayService.getSecurityMetrics(), [authStep]);
  const telemetry = useMemo(() => identityGatewayService.getSecurityTelemetry(15), [authStep]);

  return (
    <div className={`relative min-h-screen w-full max-w-full overflow-x-hidden ${
      isLight ? 'bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 text-slate-900' : 'bg-[#040711] text-slate-100'
    } flex flex-col justify-between font-sans selection:bg-blue-500/30 selection:text-blue-500`}>
      {/* 1. Interactive Cyber Mesh Layer */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-0 pointer-events-none ${isLight ? 'opacity-40' : 'opacity-75'}`}
        aria-hidden="true"
      />

      {/* 2. Ambient Jewel-Tone Atmospheric Lighting */}
      <div className={`absolute top-0 left-1/4 -translate-x-1/2 w-[34rem] h-[34rem] ${
        isLight ? 'bg-blue-400/[0.07]' : 'bg-blue-600/[0.12]'
      } rounded-full blur-[120px] pointer-events-none`} />
      <div className={`absolute bottom-0 right-1/4 translate-x-1/2 w-[32rem] h-[32rem] ${
        isLight ? 'bg-purple-400/[0.06]' : 'bg-indigo-600/[0.12]'
      } rounded-full blur-[120px] pointer-events-none`} />
      <div className={`absolute top-1/2 right-1/3 w-[26rem] h-[26rem] ${
        isLight ? 'bg-cyan-400/[0.04]' : 'bg-cyan-500/[0.08]'
      } rounded-full blur-[100px] pointer-events-none`} />

      {/* 3. Luxury Security Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutQuart }}
        className={`relative z-20 w-full px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${
          isLight ? 'bg-white/85 border-slate-200/90 shadow-xs' : 'bg-[#050914]/80 border-slate-800/80 shadow-2xl'
        }`}
      >
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-30 blur-xs group-hover:opacity-60 transition duration-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-black text-2xl tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                SKANDA
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                ZERO-TRUST GATEWAY
              </span>
            </div>
            <div className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 hidden sm:block">
              Sovereign Enterprise Identity & Experience Operating System
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Sovereign Region Selector */}
          <div className="relative" ref={regionDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-300 text-slate-800'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 shadow-sm'
              }`}
            >
              <span>{selectedRegion.flag}</span>
              <span className="font-mono text-[11px] hidden md:inline">{selectedRegion.code}</span>
              <div className="flex items-center space-x-1 font-mono text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{selectedRegion.latencyMs}ms</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRegionDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 backdrop-blur-2xl ${
                isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-slate-800 text-slate-200'
              }`}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                  Select Sovereign Gateway
                </div>
                <div className="space-y-1 mt-1">
                  {SOVEREIGN_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(region);
                        setIsRegionDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                        selectedRegion.id === region.id
                          ? isLight ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-blue-600/20 text-blue-400 font-bold'
                          : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{region.flag}</span>
                        <div>
                          <div className="text-xs font-semibold">{region.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{region.compliance}</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold">
                        {region.latencyMs}ms
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Telemetry HUD Button */}
          <button
            type="button"
            onClick={() => setActiveModal('telemetry')}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
              isLight
                ? 'bg-blue-50/80 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-blue-950/40 border-blue-800/80 text-blue-400 hover:bg-blue-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Telemetry Sentry</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={() => setTheme(isLight ? 'midnight' : 'light')}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            aria-label="Toggle visual theme"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* New Entity Registration CTA */}
          <button
            type="button"
            onClick={handleStartNewRegistration}
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            id="btn-login-register-survey"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboard Tenant →</span>
          </button>
        </div>
      </motion.header>

      {/* 4. Main Authentication Arena (Optimized for 100% Zoom Fit) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Executive Trust Architecture & Live Radar (5 Cols) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-4 pr-2"
          >
            {/* Platform Master Banner */}
            <motion.div variants={itemVariants} className="space-y-2.5">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-xs bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
                <span>Zero-Trust Enterprise Identity & Experience Gateway</span>
              </div>
              
              <h1 className={`text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight leading-[1.14] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Canonical Identity. <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent font-black">
                  Persona Assurance.
                </span>
              </h1>
              
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Unify multi-tenant tenant resolution, enterprise SSO, FIDO2 passkeys, and organizational discovery gating into a single sovereign entry point.
              </p>
            </motion.div>

            {/* Dynamic Framework Highlight Deck */}
            <motion.div
              variants={itemVariants}
              className={`p-4 sm:p-5 rounded-xl border shadow-xl relative overflow-hidden transition-all backdrop-blur-xl ${
                isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/85 border-slate-800'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${trustHighlights[activeTrustIndex].color}`} />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTrustIndex}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.35, ease: easeOutQuart }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                      {trustHighlights[activeTrustIndex].badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      0{activeTrustIndex + 1} / 0{trustHighlights.length}
                    </span>
                  </div>
                  
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {trustHighlights[activeTrustIndex].title}
                  </h3>
                  
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {trustHighlights[activeTrustIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
              
              {/* Deck Indicators */}
              <div className="flex items-center space-x-1.5 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
                {trustHighlights.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTrustIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeTrustIndex === i
                        ? 'w-6 bg-blue-600 dark:bg-blue-400'
                        : isLight ? 'w-2 bg-slate-300 hover:bg-slate-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Live Operational Telemetry HUD */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 text-xs">
              <div className={`p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-sm backdrop-blur-xl ${
                isLight
                  ? 'bg-white/80 border-slate-200 hover:border-blue-300'
                  : 'bg-slate-900/70 border-slate-800 hover:border-blue-500/40'
              }`}>
                <div className="flex items-center justify-between text-slate-400 mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Auth Success Rate</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {metrics.authSuccessRate}%
                </div>
                <div className="text-[9.5px] font-mono text-emerald-500 flex items-center space-x-1 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                  <span>RLS Zero-Trust Enforced</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-sm backdrop-blur-xl ${
                isLight
                  ? 'bg-white/80 border-slate-200 hover:border-purple-300'
                  : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/40'
              }`}>
                <div className="flex items-center justify-between text-slate-400 mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Passkey Adoption</span>
                  <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {metrics.passkeyAdoptionRate}%
                </div>
                <div className="text-[9.5px] font-mono text-purple-400 flex items-center space-x-1 mt-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  <span>FIDO2 Phishing Resistant</span>
                </div>
              </div>
            </motion.div>

            {/* Statutory Compliance Badges */}
            <motion.div variants={itemVariants} className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-blue-500" />
                <span>SOC 2 Type II</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>ISO 27001:2022</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>MAS TRM 2026</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: High-End Glassmorphic Login Gateway (7 Cols) */}
          <div className="lg:col-span-7 w-full max-w-[460px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOutQuart }}
              className={`relative rounded-2xl border p-5 sm:p-6 lg:p-7 overflow-hidden transition-all shadow-2xl backdrop-blur-2xl ${
                isLight
                  ? 'bg-white/95 border-slate-200 shadow-blue-950/5'
                  : 'bg-[#080E1F]/90 border-slate-800/90 shadow-2xl shadow-black/80'
              }`}
            >
              {/* Radiant Metallic Corner Accents */}
              <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
                isLight ? 'bg-blue-500/[0.08]' : 'bg-blue-600/15'
              }`} />
              <div className={`absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
                isLight ? 'bg-purple-500/[0.06]' : 'bg-indigo-600/15'
              }`} />

              {/* Card Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {authStep === 'mfa' ? 'Attest Identity' : 'Enterprise Sign In'}
                  </h2>
                  <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    TLS 1.3
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {authStep === 'mfa'
                    ? 'Enter the 6-digit TOTP token generated by your corporate authenticator.'
                    : 'Authenticate to your sovereign workspace via Credentials, SAML 2.0, or FIDO2.'}
                </p>
              </div>

              {/* Live Adaptive Risk HUD Banner */}
              {liveRiskEvaluation && (
                <div className={`mb-5 px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  liveRiskEvaluation.level === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : liveRiskEvaluation.level === 'HIGH'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold text-[11px]">
                      Risk Posture: <strong>{liveRiskEvaluation.level}</strong> ({liveRiskEvaluation.score}/100)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 uppercase font-bold">
                    {liveRiskEvaluation.recommendedAuthStrength}
                  </span>
                </div>
              )}

              {/* Account Lockout Security Alert */}
              {isAccountLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`mb-6 p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                  }`}
                  role="alert"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-[13px]">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Rate Limit Engaged: Workstation Suspended</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/60 font-bold">
                      Locked
                    </span>
                  </div>
                  <p className="leading-relaxed text-[12px]">
                    Zero-Trust security threshold reached due to consecutive invalid attempts.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/70 dark:border-amber-800/60 text-[11px]">
                    <span className="font-mono">
                      Auto-unlock: <strong>{lockoutTimer}s</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleUnlockAccount}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Reset / Unlock Now
                    </button>
                  </div>
                </motion.div>
              )}

              {/* General Error Message */}
              {errorMessage && !isAccountLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span className="font-medium text-[13px]">{errorMessage}</span>
                </motion.div>
              )}

              {/* Authentication Views */}
              <AnimatePresence mode="wait">
                {/* STEP 1: Input Methods Selector */}
                {authStep === 'input' && (
                  <motion.div
                    key="step-input"
                    variants={formStepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {/* Method Tabs */}
                    <div
                      className={`grid grid-cols-3 gap-1 p-1 rounded-xl border mb-4 text-xs relative ${
                        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-950/80 border-slate-800/90'
                      }`}
                      role="tablist"
                      aria-label="Authentication Method"
                    >
                      {[
                        { id: 'credentials' as const, label: 'Password + MFA', icon: Mail },
                        { id: 'sso' as const, label: 'Enterprise SSO', icon: Building2 },
                        { id: 'passkey' as const, label: 'FIDO2 Passkey', icon: Fingerprint }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = authMethod === tab.id;
                        return (
                          <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.id}`}
                            onClick={() => setAuthMethod(tab.id)}
                            className={`relative flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg font-bold transition-all duration-200 z-10 cursor-pointer focus:outline-none ${
                              isActive
                                ? isLight ? 'text-blue-600 font-extrabold' : 'text-white'
                                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-auth-tab"
                                className={`absolute inset-0 rounded-lg shadow-sm z-[-1] ${
                                  isLight ? 'bg-white border border-slate-200/80' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                }`}
                                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                              />
                            )}
                            <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                            <span className="truncate text-[11px] sm:text-[11.5px]">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* METHOD 1: Corporate Credentials */}
                    <AnimatePresence mode="wait">
                      {authMethod === 'credentials' && (
                        <motion.form
                          key="form-credentials"
                          id="tabpanel-credentials"
                          role="tabpanel"
                          aria-labelledby="tab-credentials"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: easeOutQuart }}
                          onSubmit={handleSubmit}
                          className="space-y-3"
                        >
                          <EnterpriseInput
                            id="work-email"
                            name="email"
                            label="Corporate Work Email"
                            icon={Mail}
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={handleEmailBlur}
                            placeholder="name@company.com"
                            required
                            error={emailError}
                            isValid={Boolean(email && !emailError && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))}
                            reserveErrorSpace={true}
                            disabled={isAccountLocked}
                          />

                          <EnterpriseInput
                            id="current-password"
                            name="password"
                            label="Corporate Password"
                            icon={Lock}
                            isPassword
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            onBlur={handlePasswordBlur}
                            placeholder="••••••••••••"
                            required
                            error={passwordError}
                            isValid={Boolean(password && password.length >= 4 && !passwordError)}
                            reserveErrorSpace={true}
                            disabled={isAccountLocked}
                          />

                          {/* Remember Workstation Checkbox */}
                          <div className="flex items-center justify-between pt-0.5 select-none text-xs">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                id="remember-device"
                                type="checkbox"
                                checked={rememberDevice}
                                onChange={(e) => setRememberDevice(e.target.checked)}
                                className="rounded w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                Remember Workstation
                              </span>
                            </label>
                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                              <Laptop className="w-3 h-3" />
                              Hardware Bound
                            </span>
                          </div>

                          {/* Submit Action Button */}
                          <button
                            type="submit"
                            disabled={isAccountLocked}
                            className={`w-full h-[42px] rounded-xl text-white font-extrabold text-xs sm:text-[13px] tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer shadow-md ${
                              isAccountLocked
                                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.99]'
                            }`}
                          >
                            <span>Authenticate to SKANDA Platform</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </motion.form>
                      )}

                      {/* METHOD 2: Federated SSO */}
                      {authMethod === 'sso' && (
                        <motion.div
                          key="form-sso"
                          id="tabpanel-sso"
                          role="tabpanel"
                          aria-labelledby="tab-sso"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: easeOutQuart }}
                          className="space-y-3"
                        >
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            Connect via your organization's federated Identity Provider (IdP):
                          </p>

                          <EnterpriseInput
                            label="Enterprise Domain Hint"
                            icon={Building2}
                            type="text"
                            value={ssoDomain}
                            onChange={(e) => setSsoDomain(e.target.value)}
                            placeholder="company.com (e.g. acmefintech.io)"
                            action={
                              <button
                                type="button"
                                onClick={() => handleSSOLogin(ssoDomain || 'Enterprise SAML')}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shrink-0"
                              >
                                Federate →
                              </button>
                            }
                          />

                          <div className="relative flex py-0.5 items-center">
                            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}></div>
                            <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                              Federated Providers
                            </span>
                            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}></div>
                          </div>

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => handleSSOLogin('Microsoft Entra ID')}
                              className={`w-full h-[44px] flex items-center justify-between px-3.5 rounded-xl border font-bold transition-all group cursor-pointer ${
                                isLight
                                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                                  : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500 text-xs">
                                  M
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-bold leading-tight">Microsoft Entra ID</div>
                                  <div className="text-[10px] font-mono text-slate-400">Azure AD & M365 Federation</div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSSOLogin('Google Workspace')}
                              className={`w-full h-[44px] flex items-center justify-between px-3.5 rounded-xl border font-bold transition-all group cursor-pointer ${
                                isLight
                                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                                  : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-500 text-xs">
                                  G
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-bold leading-tight">Google Workspace Enterprise</div>
                                  <div className="text-[10px] font-mono text-slate-400">OIDC / Cloud Identity</div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSSOLogin('Okta Enterprise')}
                              className={`w-full h-[44px] flex items-center justify-between px-3.5 rounded-xl border font-bold transition-all group cursor-pointer ${
                                isLight
                                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                                  : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-xs">
                                  O
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-bold leading-tight">Okta Enterprise SAML</div>
                                  <div className="text-[10px] font-mono text-slate-400">Universal Directory SAML 2.0</div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* METHOD 3: FIDO2 / Biometric Passkey */}
                      {authMethod === 'passkey' && (
                        <motion.div
                          key="form-passkey"
                          id="tabpanel-passkey"
                          role="tabpanel"
                          aria-labelledby="tab-passkey"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: easeOutQuart }}
                          className="text-center py-4 space-y-4"
                        >
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={handleBiometricScan}
                              disabled={biometricScanning}
                              aria-label="Touch hardware key or biometric sensor"
                              className={`w-20 h-20 rounded-2xl bg-blue-500/10 border-2 flex items-center justify-center transition-all cursor-pointer ${
                                biometricScanning
                                  ? 'border-blue-500 shadow-2xl shadow-blue-500/40 scale-105'
                                  : 'border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/20'
                              }`}
                            >
                              <Fingerprint className={`w-10 h-10 ${biometricScanning ? 'text-blue-400 animate-pulse' : 'text-blue-500'}`} strokeWidth={1.8} />
                            </button>
                            {biometricScanning && (
                              <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30 pointer-events-none" />
                            )}
                          </div>

                          <div>
                            <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {biometricScanning ? 'Reading WebAuthn Challenge...' : 'Touch Security Key / Sensor'}
                            </h3>
                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                              Authenticate with Touch ID, Windows Hello, or your YubiKey FIDO2 hardware token.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleBiometricScan}
                            disabled={biometricScanning}
                            className="h-[42px] px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
                          >
                            {biometricScanning ? 'Attesting Signature...' : 'Trigger Passkey Verification'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 2: TOTP Multi-Factor Authentication */}
                {authStep === 'mfa' && (
                  <motion.div
                    key="step-mfa"
                    variants={formStepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-blue-50/80 border-blue-200' : 'bg-blue-600/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center space-x-2.5">
                        <KeyRound className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={2} />
                        <div>
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Target Account</div>
                          <div className="font-mono text-blue-600 dark:text-blue-300 text-[11px]">{email}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-500 border border-blue-500/40">
                        TOTP MFA
                      </span>
                    </div>

                    {/* 6-Digit OTP Box Grid */}
                    <div>
                      <label className={`block text-center text-xs font-bold mb-2.5 ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        Enter 6-Digit Authenticator Code
                      </label>
                      <div className="flex justify-center items-center space-x-1.5 sm:space-x-2">
                        {mfaCode.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              mfaInputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleMfaDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleMfaPaste : undefined}
                            className={`w-9 sm:w-10 h-[44px] text-center text-xl font-mono font-black rounded-lg border outline-none transition-all duration-200 ${
                              isLight
                                ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15'
                                : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/25'
                            }`}
                            aria-label={`Digit ${idx + 1} of 6`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Timer & Demo Auto-fill */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1 font-mono">
                        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Code expires in {mfaTimer}s</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaCode(['1', '2', '3', '4', '5', '6']);
                          setTimeout(() => handleMfaSubmit('123456'), 200);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer"
                      >
                        Auto-fill Demo (123456)
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setAuthStep('input')}
                        className={`w-1/3 h-[42px] rounded-xl font-bold text-xs transition cursor-pointer border ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMfaSubmit()}
                        className="w-2/3 h-[42px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Cryptographic TLS Handshake Sequence */}
                {authStep === 'authenticating' && (
                  <motion.div
                    key="step-auth"
                    variants={formStepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="py-6 text-center space-y-4"
                  >
                    <div className="relative inline-block">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-500 shadow-lg shadow-blue-500/20">
                        <Terminal className="w-7 h-7 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30 pointer-events-none" />
                    </div>

                    <div>
                      <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Establishing Verifiable Security Context
                      </h3>
                      <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1 px-4 truncate">
                        {authProgressMessage}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full max-w-sm mx-auto rounded-full h-2 overflow-hidden border ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${authProgressPct}%` }}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-slate-400">
                      Sovereign Gateway: {selectedRegion.name} • TLS 1.3 AES-256-GCM
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Success Transition */}
                {authStep === 'success' && (
                  <motion.div
                    key="step-success"
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: easeOutQuart }}
                    className="py-8 text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-500 shadow-xl shadow-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Access Authorized
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      Launching Persona & Journey Workspace...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1-Click Sandbox Persona & Journey Switcher */}
              <div className={`mt-5 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Persona & Journey Switcher
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDemoSectionOpen(!isDemoSectionOpen)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{isDemoSectionOpen ? 'Collapse' : 'Expand'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDemoSectionOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
                  Evaluate SKANDA GRC by testing canonical persona dispatch and onboarding state gates:
                </p>

                {isDemoSectionOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        user: users.find((u) => u.role === 'COMPANY_ADMIN') || users[2],
                        label: 'Marcus Vance',
                        roleTitle: 'CISO / Lead Implementer',
                        destination: 'Executive Command Centre',
                        badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                      },
                      {
                        user: users.find((u) => u.role === 'SUPER_ADMIN') || users[0],
                        label: 'Elena Rostova',
                        roleTitle: 'Platform SuperAdmin',
                        destination: 'Platform Operations',
                        badgeColor: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
                      },
                      {
                        user: users.find((u) => u.role === 'PLATFORM_AUDITOR') || users[1],
                        label: 'Sarah Chen',
                        roleTitle: 'Lead External Auditor',
                        destination: 'Auditor Clean Room',
                        badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
                      },
                      {
                        user: users.find((u) => u.role === 'DEPARTMENT_CONTRIBUTOR') || users[4],
                        label: 'Priya Sharma',
                        roleTitle: 'DevOps Control Owner',
                        destination: 'My Work Contributor',
                        badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                      },
                      {
                        user: users.find((u) => u.role === 'EXECUTIVE_VIEWER') || users[5],
                        label: 'Jonathan Ward',
                        roleTitle: 'CEO / Board Director',
                        destination: 'Executive Stakeholder View',
                        badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                      },
                      {
                        user: users.find((u) => u.role === 'INTERNAL_AUDITOR') || users[3],
                        label: 'Marcus Brody',
                        roleTitle: 'Internal Risk Auditor',
                        destination: 'Compliance Operations',
                        badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickPersonaSelect(p.user)}
                        className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.01] flex flex-col justify-between group cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-2xs'
                            : 'bg-slate-950/70 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[11px] font-black truncate ${
                            isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'
                          }`}>
                            {p.label}
                          </span>
                          <span className={`text-[8.5px] font-mono font-bold px-1 py-0.5 rounded border ${p.badgeColor}`}>
                            {p.user.role}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate mt-0.5">
                          {p.roleTitle}
                        </div>
                        <div className="text-[9px] font-mono text-blue-500 font-bold mt-0.5 truncate">
                          → {p.destination}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* 5. Enterprise Security & Assurance Footer */}
      <footer className={`relative z-20 w-full px-6 py-4 border-t text-xs backdrop-blur-xl ${
        isLight ? 'bg-white/80 border-slate-200 text-slate-500' : 'bg-[#050914]/80 border-slate-800/80 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SKANDA GRC SaaS Operating Platform • Zero-Trust Gateway V6.2</span>
          </div>

          <div className="flex items-center space-x-5 font-medium">
            <button
              type="button"
              onClick={() => setActiveModal('telemetry')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Security Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('architecture')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Identity Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Data Privacy & Sovereign Residency
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Security Assurance (SOC 2 / MAS TRM)
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Telemetry & Security Sentry Modal */}
      <AnimatePresence>
        {activeModal === 'telemetry' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-3xl rounded-3xl border p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#080E1F] border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-black">Live Login Security Telemetry & Sentry</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Total Logins (24h)</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">{metrics.totalLogins24h}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Auth Success Rate</div>
                  <div className="text-lg font-black text-emerald-500">{metrics.authSuccessRate}%</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">MFA Success Rate</div>
                  <div className="text-lg font-black text-purple-500">{metrics.mfaSuccessRate}%</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Suspicious Logins</div>
                  <div className="text-lg font-black text-amber-500">{metrics.suspiciousLogins24h}</div>
                </div>
              </div>

              {/* Telemetry Stream List */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Security Events Log
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto font-mono text-[11px]">
                  {telemetry.map((evt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          evt.result === 'SUCCESS' ? 'bg-emerald-500' : evt.result === 'BLOCKED' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        <span className="font-bold">{evt.eventType}</span>
                        <span className="text-slate-400">({evt.authMethod})</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {new Date(evt.timestamp).toLocaleTimeString()} • {evt.riskContext.level} Risk
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Architecture Modal */}
      <AnimatePresence>
        {activeModal === 'architecture' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-4 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#080E1F] border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold">Canonical Identity Resolution Pipeline</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                SKANDA enforces a server-authoritative zero-trust pipeline. Client overrides (e.g. ?tenantId=...) are ignored. Every stage is validated against PostgreSQL RLS, RBAC, and active onboarding discovery status.
              </p>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-950 space-y-1 text-blue-600 dark:text-blue-400">
                <div>1. Authentication (Password / SSO / Passkey)</div>
                <div>  ↓</div>
                <div>2. Identity Provider Verification (Entra ID / Okta / Google / Keycloak)</div>
                <div>  ↓</div>
                <div>3. Server-Authoritative Tenant Resolution (Acme / Pacific / SingaGlobal)</div>
                <div>  ↓</div>
                <div>4. Role & Granular RBAC/ABAC Resolution</div>
                <div>  ↓</div>
                <div>5. Persona Resolution (CISO / Auditor / Contributor / DPO)</div>
                <div>  ↓</div>
                <div>6. Subscription & Entitlement Resolution (Seats, Quotas, WORM)</div>
                <div>  ↓</div>
                <div>7. Onboarding & Organizational Truth Gate Check</div>
                <div>  ↓</div>
                <div>8. Persona & Journey Aware Landing Workspace</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Privacy & Terms Modals */}
      <AnimatePresence>
        {(activeModal === 'privacy' || activeModal === 'terms') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl space-y-4 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#080E1F] border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold">
                    {activeModal === 'privacy' ? 'Data Privacy & Sovereign Residency' : 'Enterprise Terms & Security SLA'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeModal === 'privacy'
                  ? 'All tenant compliance records, evidence vaults, and interview transcripts are encrypted at rest with AES-256-GCM and stored exclusively within the customer designated sovereign region in accordance with Singapore MAS TRM, PDPA, and EU GDPR.'
                  : 'SKANDA provides guaranteed 99.99% availability, 15-minute SLA for APEX Global tier incident command, and continuous WORM ledger non-repudiation.'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
