/**
 * CopilotPositionManager
 * Manages viewport boundaries, intelligent edge snapping,
 * smart expanded panel positioning, and localStorage persistence for SKANDA GRC AI Copilot.
 */

export interface CopilotPosition {
  x: number;
  y: number;
}

export type SnapPreset = 
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'middle-right'
  | 'middle-left';

const STORAGE_KEY = 'skanda_grc_copilot_position_v2';
const SAFE_MARGIN = 16;
const LAUNCHER_SIZE_DESKTOP = 56;
const LAUNCHER_SIZE_MOBILE = 52;

export const getLauncherSize = (): number => {
  if (typeof window === 'undefined') return LAUNCHER_SIZE_DESKTOP;
  return window.innerWidth < 640 ? LAUNCHER_SIZE_MOBILE : LAUNCHER_SIZE_DESKTOP;
};

/**
 * Clamps coordinates within viewport margins
 */
export const clampPosition = (pos: CopilotPosition, size: number = getLauncherSize()): CopilotPosition => {
  if (typeof window === 'undefined') return pos;
  const maxX = Math.max(SAFE_MARGIN, window.innerWidth - size - SAFE_MARGIN);
  const maxY = Math.max(SAFE_MARGIN, window.innerHeight - size - SAFE_MARGIN);

  return {
    x: Math.min(Math.max(SAFE_MARGIN, pos.x), maxX),
    y: Math.min(Math.max(SAFE_MARGIN, pos.y), maxY)
  };
};

/**
 * Calculates default bottom-right position
 */
export const getDefaultPosition = (): CopilotPosition => {
  if (typeof window === 'undefined') return { x: 100, y: 100 };
  const size = getLauncherSize();
  return {
    x: window.innerWidth - size - 24,
    y: window.innerHeight - size - 24
  };
};

/**
 * Loads saved position or fallback to default
 */
export const loadSavedPosition = (): CopilotPosition => {
  if (typeof window === 'undefined') return { x: 100, y: 100 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return clampPosition(parsed);
      }
    }
  } catch {
    // ignore parse failure
  }
  return getDefaultPosition();
};

/**
 * Persists position
 */
export const savePosition = (pos: CopilotPosition): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // ignore storage failure
  }
};

/**
 * Clears stored position
 */
export const clearSavedPosition = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Returns preset coordinates for accessible movement
 */
export const getPresetPosition = (preset: SnapPreset): CopilotPosition => {
  if (typeof window === 'undefined') return { x: 100, y: 100 };
  const size = getLauncherSize();
  const maxX = window.innerWidth - size - SAFE_MARGIN;
  const maxY = window.innerHeight - size - SAFE_MARGIN;
  const midY = (window.innerHeight - size) / 2;

  switch (preset) {
    case 'top-left':
      return { x: SAFE_MARGIN, y: SAFE_MARGIN };
    case 'top-right':
      return { x: maxX, y: SAFE_MARGIN };
    case 'middle-left':
      return { x: SAFE_MARGIN, y: midY };
    case 'middle-right':
      return { x: maxX, y: midY };
    case 'bottom-left':
      return { x: SAFE_MARGIN, y: maxY };
    case 'bottom-right':
    default:
      return { x: maxX, y: maxY };
  }
};

/**
 * Intelligent Edge Snapping:
 * When user releases the widget, snaps comfortably to the closest edge
 * without violently forcing to a corner if dropped along an edge.
 */
export const calculateSmartSnap = (pos: CopilotPosition): CopilotPosition => {
  if (typeof window === 'undefined') return pos;
  const size = getLauncherSize();
  const clamped = clampPosition(pos, size);

  const minX = SAFE_MARGIN;
  const maxX = window.innerWidth - size - SAFE_MARGIN;
  const minY = SAFE_MARGIN;
  const maxY = window.innerHeight - size - SAFE_MARGIN;

  const distToLeft = clamped.x - minX;
  const distToRight = maxX - clamped.x;
  const distToTop = clamped.y - minY;
  const distToBottom = maxY - clamped.y;

  // Find closest vertical edge (left vs right)
  const snapToX = distToLeft < distToRight ? minX : maxX;

  // If user dropped it near top or bottom boundary (< 60px), snap Y as well
  let snapToY = clamped.y;
  if (distToTop < 70) {
    snapToY = minY;
  } else if (distToBottom < 70) {
    snapToY = maxY;
  }

  return {
    x: snapToX,
    y: snapToY
  };
};

/**
 * Smart Panel Placement:
 * Calculates position for expanded Copilot Panel based on Launcher coordinates
 * ensuring it opens naturally from launcher without clipping viewport boundaries.
 */
export interface PanelPlacement {
  left: number;
  top: number;
  origin: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  width: number;
  height: number;
}

export const calculatePanelPlacement = (
  launcherPos: CopilotPosition,
  launcherSize: number = getLauncherSize()
): PanelPlacement => {
  if (typeof window === 'undefined') {
    return { left: 100, top: 100, origin: 'bottom-right', width: 420, height: 600 };
  }

  const isMobile = window.innerWidth < 640;
  const panelWidth = isMobile ? Math.max(300, window.innerWidth - 24) : 420;
  const panelHeight = isMobile
    ? Math.min(640, window.innerHeight - 80)
    : Math.min(620, Math.max(540, window.innerHeight - 60));

  if (isMobile) {
    // On mobile, dock cleanly at bottom center with safe margins
    return {
      left: 12,
      top: Math.max(SAFE_MARGIN, window.innerHeight - panelHeight - 12),
      origin: 'bottom-right',
      width: panelWidth,
      height: panelHeight
    };
  }

  const launcherCenter = {
    x: launcherPos.x + launcherSize / 2,
    y: launcherPos.y + launcherSize / 2
  };

  const isRightSide = launcherCenter.x > window.innerWidth / 2;
  const isBottomSide = launcherCenter.y > window.innerHeight / 2;

  let left: number;
  let top: number;
  let origin: PanelPlacement['origin'];

  if (isRightSide && isBottomSide) {
    // Bottom-Right quadrant -> Open Above & to the Left of launcher
    left = launcherPos.x + launcherSize - panelWidth;
    top = launcherPos.y - panelHeight - 12;
    origin = 'bottom-right';
  } else if (!isRightSide && isBottomSide) {
    // Bottom-Left quadrant -> Open Above & to the Right of launcher
    left = launcherPos.x;
    top = launcherPos.y - panelHeight - 12;
    origin = 'bottom-left';
  } else if (isRightSide && !isBottomSide) {
    // Top-Right quadrant -> Open Below & to the Left of launcher
    left = launcherPos.x + launcherSize - panelWidth;
    top = launcherPos.y + launcherSize + 12;
    origin = 'top-right';
  } else {
    // Top-Left quadrant -> Open Below & to the Right of launcher
    left = launcherPos.x;
    top = launcherPos.y + launcherSize + 12;
    origin = 'top-left';
  }

  // Safety clamp to ensure panel is 100% inside viewport
  const maxLeft = window.innerWidth - panelWidth - SAFE_MARGIN;
  const maxTop = window.innerHeight - panelHeight - SAFE_MARGIN;

  const clampedLeft = Math.min(Math.max(SAFE_MARGIN, left), maxLeft);
  const clampedTop = Math.min(Math.max(SAFE_MARGIN, top), maxTop);

  return {
    left: clampedLeft,
    top: clampedTop,
    origin,
    width: panelWidth,
    height: panelHeight
  };
};

/**
 * CopilotPositionManager
 * Lightweight manager utilizing localStorage to persist user-preferred X & Y coordinates
 * for the AI widget and supporting reset to default state.
 */
export class CopilotPositionManager {
  static readonly STORAGE_KEY = STORAGE_KEY;
  static readonly SAFE_MARGIN = SAFE_MARGIN;

  /**
   * Loads persisted X & Y coordinates from local storage, or defaults to bottom-right
   */
  static loadPosition(): CopilotPosition {
    return loadSavedPosition();
  }

  /**
   * Alias for loadPosition
   */
  static getPosition(): CopilotPosition {
    return loadSavedPosition();
  }

  /**
   * Persists preferred X & Y coordinates to local storage
   */
  static savePosition(pos: CopilotPosition): void {
    savePosition(pos);
  }

  /**
   * Alias for savePosition
   */
  static setPosition(pos: CopilotPosition): void {
    savePosition(pos);
  }

  /**
   * Reverts coordinates to the default state and clears local storage
   */
  static resetPosition(): CopilotPosition {
    clearSavedPosition();
    return getDefaultPosition();
  }

  /**
   * Clears persisted coordinates from local storage
   */
  static clearSavedPosition(): void {
    clearSavedPosition();
  }

  /**
   * Checks whether the user has customized and persisted coordinates in local storage
   */
  static hasCustomPosition(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Calculates default initial position (bottom-right viewport edge)
   */
  static getDefaultPosition(): CopilotPosition {
    return getDefaultPosition();
  }

  /**
   * Clamps coordinates within viewport boundaries
   */
  static clampPosition(pos: CopilotPosition, size?: number): CopilotPosition {
    return clampPosition(pos, size);
  }

  /**
   * Calculates smart glide snapping to closest comfortable viewport edge
   */
  static calculateSmartSnap(pos: CopilotPosition): CopilotPosition {
    return calculateSmartSnap(pos);
  }

  /**
   * Retrieves predefined corner or edge docking presets
   */
  static getPresetPosition(preset: SnapPreset): CopilotPosition {
    return getPresetPosition(preset);
  }

  /**
   * Calculates optimal bounds and alignment for expanded panel
   */
  static calculatePanelPlacement(pos: CopilotPosition, size?: number): PanelPlacement {
    return calculatePanelPlacement(pos, size);
  }

  /**
   * Gets adaptive launcher size
   */
  static getLauncherSize(): number {
    return getLauncherSize();
  }
}

export default CopilotPositionManager;
