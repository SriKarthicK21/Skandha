import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SkandaGRCopilotIcon } from './SkandaGRCopilotIcon';
import {
  CopilotPositionManager,
  CopilotPosition,
  clampPosition,
  calculateSmartSnap,
  getLauncherSize,
  savePosition
} from './CopilotPositionManager';

export interface CopilotLauncherProps {
  position: CopilotPosition;
  onPositionChange: (newPos: CopilotPosition) => void;
  onToggle: () => void;
  status: 'online' | 'processing' | 'offline' | 'idle';
  currentFrameworkLabel?: string;
  isExpanded: boolean;
}

/**
 * CopilotLauncher
 * Precision movable floating launcher for SKANDA GRC AI Copilot.
 * 
 * Chief UX & Interaction Specs:
 * - 60/120fps fluid pointer tracking with window listener capture
 * - Drag vs Click discriminator (>4px threshold)
 * - Glide snap physics with cubic-bezier easing
 * - Active state glow ring when panel is expanded
 * - Accessible keyboard navigation & rich tooltip
 */
export const CopilotLauncher: React.FC<CopilotLauncherProps> = ({
  position,
  onPositionChange,
  onToggle,
  status = 'online',
  currentFrameworkLabel = 'ISO 27001:2022',
  isExpanded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // References for drag calculation
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  } | null>(null);

  const wasDraggedRef = useRef(false);
  const tooltipTimerRef = useRef<number | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const launcherSize = getLauncherSize();

  // Status text & indicator styling
  const statusLabel =
    status === 'processing'
      ? 'Processing GRC Intelligence...'
      : status === 'offline'
      ? 'Offline'
      : 'Online';

  const statusDotClass =
    status === 'processing'
      ? 'bg-amber-400 ring-2 ring-amber-400/50 animate-pulse'
      : status === 'offline'
      ? 'bg-rose-500 ring-2 ring-rose-500/50'
      : 'bg-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.8)]';

  // Tooltip hover delay
  useEffect(() => {
    if ((isHovered || isFocused) && !isDragging && !isExpanded) {
      tooltipTimerRef.current = window.setTimeout(() => {
        setShowTooltip(true);
      }, 200);
    } else {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      setShowTooltip(false);
    }
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [isHovered, isFocused, isDragging, isExpanded]);

  // Window pointer event handlers for bulletproof drag tracking
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      // Threshold check: 4px
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragRef.current.hasMoved = true;
        wasDraggedRef.current = true;
      }

      if (dragRef.current.hasMoved) {
        const nextPos = clampPosition(
          {
            x: dragRef.current.initialX + deltaX,
            y: dragRef.current.initialY + deltaY
          },
          launcherSize
        );
        onPositionChange(nextPos);
      }
    };

    const handlePointerUp = () => {
      if (!dragRef.current) return;

      const didMove = dragRef.current.hasMoved;
      dragRef.current = null;
      setIsDragging(false);

      if (didMove) {
        // Snap to nearest comfortable edge
        const snapped = calculateSmartSnap(position);
        onPositionChange(snapped);
        savePosition(snapped);
        try {
          if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
            navigator.vibrate(6);
          }
        } catch {
          // ignore
        }

        // Reset wasDragged after event loop to prevent accidental click firing
        setTimeout(() => {
          wasDraggedRef.current = false;
        }, 80);
      } else {
        wasDraggedRef.current = false;
      }
    };

    const handlePointerCancel = () => {
      dragRef.current = null;
      setIsDragging(false);
      wasDraggedRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerCancel, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [isDragging, launcherSize, onPositionChange, position]);

  // Pointer Down: Start tracking drag
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Primary mouse button only

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    };

    wasDraggedRef.current = false;
    setIsDragging(true);
    setShowTooltip(false);
  };

  // Button Click handler: Dispatches toggle only if not dragging
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (wasDraggedRef.current) {
      return;
    }
    onToggle();
  };

  // Keyboard navigation: Enter or Space toggles
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  // Tooltip orientation relative to screen edge
  const isNearRight = typeof window !== 'undefined' ? position.x > window.innerWidth - 240 : true;
  const isNearTop = position.y < 120;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${launcherSize}px`,
        height: `${launcherSize}px`,
        zIndex: 40,
        touchAction: 'none',
        transition: isDragging
          ? 'none'
          : 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1), top 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s ease-out'
      }}
      className={`select-none ${isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Floating Compact Launcher Button */}
      <button
        ref={launcherRef}
        type="button"
        id="skanda-grc-copilot-launcher"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={`GRC AI Copilot — ${statusLabel}. ${isExpanded ? 'Click to minimize.' : 'Click to open.'} (⌘J)`}
        aria-expanded={isExpanded}
        aria-haspopup="dialog"
        tabIndex={0}
        className={`group relative w-full h-full rounded-2xl flex items-center justify-center p-0 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isDragging
            ? 'shadow-[0_24px_48px_rgba(0,0,0,0.85),0_0_30px_rgba(99,102,241,0.6)] border-indigo-400 bg-[#0F1424]'
            : isExpanded
            ? 'shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_24px_rgba(99,102,241,0.45)] border-indigo-400/90 bg-[#121932] ring-2 ring-indigo-500/40'
            : 'shadow-[0_12px_32px_rgba(0,0,0,0.65),0_0_18px_rgba(99,102,241,0.25)] border-indigo-500/40 hover:border-indigo-400/80 bg-[#0F1424]/95 hover:bg-[#141B32] hover:shadow-[0_18px_42px_rgba(0,0,0,0.75),0_0_28px_rgba(99,102,241,0.45)]'
        } border backdrop-blur-xl active:scale-95`}
      >
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-sky-500/20 opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Unique SKANDA GRC Copilot SVG Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <SkandaGRCopilotIcon
            size={launcherSize >= 56 ? 34 : 30}
            status={status}
            animate={true}
          />
        </div>

        {/* Online / Processing Status Dot */}
        <span
          className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0F19] ${statusDotClass}`}
          aria-hidden="true"
        />

        {/* Tactile drag grip pill indicator */}
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-slate-600/70 group-hover:bg-indigo-400 transition-colors" />
      </button>

      {/* Accessible Floating Tooltip */}
      {showTooltip && !isDragging && !isExpanded && (
        <div
          role="tooltip"
          id="copilot-tooltip"
          className={`absolute pointer-events-none z-50 whitespace-nowrap px-3 py-2 rounded-xl bg-slate-900/98 text-white border border-indigo-500/35 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in-0 zoom-in-95 ${
            isNearRight ? 'right-full mr-3' : 'left-full ml-3'
          } ${isNearTop ? 'top-0' : 'top-1/2 -translate-y-1/2'}`}
          style={{ minWidth: '220px' }}
        >
          <div className="flex items-center justify-between space-x-2">
            <span className="font-bold text-xs text-white flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>GRC AI Copilot</span>
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {statusLabel}
            </span>
          </div>
          <p className="text-[10px] text-indigo-200/90 font-medium mt-1">
            Ask about risks, controls, evidence & audit readiness
          </p>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800 font-mono">
            <span className="text-slate-400 truncate max-w-[120px]">{currentFrameworkLabel}</span>
            <span className="text-indigo-300 font-sans font-semibold">⌘J</span>
          </div>
        </div>
      )}
    </div>
  );
};
