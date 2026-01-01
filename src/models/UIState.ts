/**
 * Application modes
 */
export type AppMode = 'play' | 'mapping' | 'solve';

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
}

/**
 * Playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentStepIndex: number;
  speed: number; // 0.5 to 3.0
}

/**
 * UI State model
 */
export interface UIState {
  mode: AppMode;
  sidebar: SidebarState;
  playback: PlaybackState;
  reducedMotion: boolean;
}

/**
 * Create initial UI state
 */
export function createInitialUIState(): UIState {
  return {
    mode: 'play',
    sidebar: {
      isOpen: false,
      isCollapsed: false,
      width: 320,
    },
    playback: {
      isPlaying: false,
      currentStepIndex: -1,
      speed: 1.0,
    },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

