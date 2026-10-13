import React, { useId } from 'react';

export interface SkandaGRCopilotIconProps {
  size?: number;
  className?: string;
  status?: 'online' | 'processing' | 'offline' | 'idle';
  animate?: boolean;
}

/**
 * SkandaGRCopilotIcon - Distinctive SKANDA GRC AI Identity
 * 
 * Visual Architecture:
 * - Rounded hexagonal / shield intelligence core
 * - Central intelligent core node (AI Intelligence)
 * - 4 connected perimeter governance nodes:
 *     Top: Audit (Clause 9.2/9.3)
 *     Right: Compliance (Statutory Frameworks)
 *     Bottom: Controls (Annex A Implementation)
 *     Left: Risk (Clause 6.1.2 Threat Models)
 * - Orbital quantum governance ring & neural bus interconnects
 * - Unique instance ID prefixing to prevent SVG gradient collision across multiple instances
 * - Respects prefers-reduced-motion
 */
export const SkandaGRCopilotIcon: React.FC<SkandaGRCopilotIconProps> = ({
  size = 32,
  className = '',
  status = 'online',
  animate = true
}) => {
  const uid = useId().replace(/:/g, '_');
  const isProcessing = status === 'processing';
  const isOffline = status === 'offline';

  const shieldGradId = `skandaShieldGrad_${uid}`;
  const coreGlowId = `skandaCoreGlow_${uid}`;
  const orbitGradId = `skandaOrbitGrad_${uid}`;
  const nodeGradId = `skandaNodeGrad_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
      role="img"
    >
      <defs>
        {/* Shield Gradient */}
        <linearGradient id={shieldGradId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isOffline ? '#64748B' : '#818CF8'} />
          <stop offset="50%" stopColor={isOffline ? '#475569' : '#6366F1'} />
          <stop offset="100%" stopColor={isOffline ? '#334155' : '#0EA5E9'} />
        </linearGradient>

        {/* Core Node Glow */}
        <radialGradient id={coreGlowId} cx="24" cy="24" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isOffline ? '#94A3B8' : '#38BDF8'} stopOpacity="1" />
          <stop offset="60%" stopColor={isOffline ? '#64748B' : '#818CF8'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={isOffline ? '#334155' : '#4F46E5'} stopOpacity="0" />
        </radialGradient>

        {/* Orbit Track Gradient */}
        <linearGradient id={orbitGradId} x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.75" />
        </linearGradient>

        {/* Node Diamond Gradient */}
        <linearGradient id={nodeGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* 1. Outer Protective Shield Geometry */}
      <path
        d="M24 4L39 10.5C39 24 33 36 24 43C15 36 9 24 9 10.5L24 4Z"
        stroke={`url(#${shieldGradId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#0F172A"
        fillOpacity="0.85"
      />

      {/* 2. Inner Hexagonal Orbit Ring (Subtle Track) */}
      <circle
        cx="24"
        cy="23.5"
        r="11.5"
        stroke={`url(#${orbitGradId})`}
        strokeWidth="1.2"
        strokeDasharray="2 3"
        className={animate && isProcessing ? 'motion-safe:animate-spin origin-[24px_23.5px] [animation-duration:3.5s]' : ''}
      />

      {/* 3. Neural Interconnect Bus Lines linking Core to 4 Governance Nodes */}
      {/* Center to Top (Audit) */}
      <line x1="24" y1="23.5" x2="24" y2="12" stroke="#818CF8" strokeWidth="1.25" strokeLinecap="round" opacity="0.85" />
      {/* Center to Right (Compliance) */}
      <line x1="24" y1="23.5" x2="35.5" y2="23.5" stroke="#38BDF8" strokeWidth="1.25" strokeLinecap="round" opacity="0.85" />
      {/* Center to Bottom (Controls) */}
      <line x1="24" y1="23.5" x2="24" y2="35" stroke="#818CF8" strokeWidth="1.25" strokeLinecap="round" opacity="0.85" />
      {/* Center to Left (Risk) */}
      <line x1="24" y1="23.5" x2="12.5" y2="23.5" stroke="#38BDF8" strokeWidth="1.25" strokeLinecap="round" opacity="0.85" />

      {/* 4. Four Connected Governance Diamond Nodes */}
      {/* Top Node: Audit (Diamond) */}
      <g transform="translate(24, 12)">
        <polygon
          points="0,-3.5 3.5,0 0,3.5 -3.5,0"
          fill={isOffline ? '#64748B' : '#A78BFA'}
          stroke="#0F172A"
          strokeWidth="0.75"
        />
      </g>

      {/* Right Node: Compliance (Diamond) */}
      <g transform="translate(35.5, 23.5)">
        <polygon
          points="0,-3.5 3.5,0 0,3.5 -3.5,0"
          fill={isOffline ? '#64748B' : '#38BDF8'}
          stroke="#0F172A"
          strokeWidth="0.75"
        />
      </g>

      {/* Bottom Node: Controls (Diamond) */}
      <g transform="translate(24, 35)">
        <polygon
          points="0,-3.5 3.5,0 0,3.5 -3.5,0"
          fill={isOffline ? '#64748B' : '#818CF8'}
          stroke="#0F172A"
          strokeWidth="0.75"
        />
      </g>

      {/* Left Node: Risk (Diamond) */}
      <g transform="translate(12.5, 23.5)">
        <polygon
          points="0,-3.5 3.5,0 0,3.5 -3.5,0"
          fill={isOffline ? '#64748B' : '#38BDF8'}
          stroke="#0F172A"
          strokeWidth="0.75"
        />
      </g>

      {/* 5. Central AI Intelligence Core Node */}
      {/* Subtle background glow */}
      <circle
        cx="24"
        cy="23.5"
        r="7"
        fill={`url(#${coreGlowId})`}
        opacity={isProcessing ? "0.9" : "0.6"}
        className={animate && isProcessing ? 'motion-safe:animate-pulse' : ''}
      />
      
      {/* Center Core Body */}
      <circle
        cx="24"
        cy="23.5"
        r="4.2"
        fill={isOffline ? '#475569' : '#0284C7'}
        stroke={isOffline ? '#94A3B8' : '#BAE6FD'}
        strokeWidth="1.2"
      />

      {/* Micro-spark central intelligence pupil */}
      <circle
        cx="24"
        cy="23.5"
        r="1.8"
        fill={isOffline ? '#CBD5E1' : '#FFFFFF'}
      />
    </svg>
  );
};
