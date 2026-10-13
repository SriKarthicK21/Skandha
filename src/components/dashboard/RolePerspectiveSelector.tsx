import React, { useRef } from 'react';
import {
  Shield,
  Briefcase,
  FileCheck2,
  Users,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

export type EnterpriseRole = 'ciso' | 'grc_manager' | 'lead_auditor' | 'board' | 'dpo';

interface RolePerspectiveSelectorProps {
  currentRole: EnterpriseRole;
  onSelectRole: (role: EnterpriseRole) => void;
  className?: string;
}

export const ROLE_CONFIGS: Record<EnterpriseRole, { title: string; subtitle: string; icon: any; badge: string }> = {
  ciso: {
    title: 'CISO / Head of InfoSec',
    subtitle: 'Strategic posture, critical residual risk, threat landscape, & active CAPAs',
    icon: Shield,
    badge: 'Security Executive'
  },
  grc_manager: {
    title: 'GRC & Compliance Manager',
    subtitle: 'Operational control effectiveness, gap remediation, & evidence tracking',
    icon: Briefcase,
    badge: 'Operational GRC'
  },
  lead_auditor: {
    title: 'Lead External / Internal Auditor',
    subtitle: 'Stage 1/Stage 2 gates, workpaper hashes, & non-conformity findings',
    icon: FileCheck2,
    badge: 'Audit & Assurance'
  },
  board: {
    title: 'Board of Directors / Audit Committee',
    subtitle: 'High-level compliance health, risk appetite tolerance, & regulatory liabilities',
    icon: Users,
    badge: 'Governance & Board'
  },
  dpo: {
    title: 'Data Protection Officer (DPO)',
    subtitle: 'GDPR/DPDP compliance, DPIA assessments, & privacy consent tracking',
    icon: Eye,
    badge: 'Privacy & Governance'
  }
};

export const RolePerspectiveSelector: React.FC<RolePerspectiveSelectorProps> = ({
  currentRole,
  onSelectRole,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);

  const roles: EnterpriseRole[] = ['ciso', 'grc_manager', 'lead_auditor', 'board', 'dpo'];

  const handleSelect = (role: EnterpriseRole) => {
    GrcNavigationService.savePerspective(role);
    onSelectRole(role);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % roles.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + roles.length) % roles.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = roles.length - 1;
    }

    if (nextIndex !== index) {
      handleSelect(roles[nextIndex]);
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      id="role-perspective-selector"
      role="tablist"
      aria-label="GRC Persona Perspective Selector"
      className={`flex items-center space-x-1.5 p-1 rounded-xl border overflow-x-auto ${
        isLight
          ? 'bg-slate-100/90 border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      } ${className}`}
    >
      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold shrink-0">
        Perspective:
      </div>
      {roles.map((role, idx) => {
        const config = ROLE_CONFIGS[role];
        const Icon = config.icon;
        const isActive = currentRole === role;
        return (
          <button
            key={role}
            role="tab"
            aria-selected={isActive}
            id={`perspective-tab-${role}`}
            aria-controls={`perspective-panel-${role}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => handleSelect(role)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center space-x-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={config.subtitle}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{config.title.split('/')[0].trim()}</span>
          </button>
        );
      })}
    </div>
  );
};
