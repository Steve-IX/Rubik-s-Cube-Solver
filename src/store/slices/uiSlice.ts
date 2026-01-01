import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState, AppMode } from '../../models/UIState';
import { createInitialUIState } from '../../models/UIState';

const initialState: UIState = createInitialUIState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = action.payload;
    },
    setPlaybackPlaying: (state, action: PayloadAction<boolean>) => {
      state.playback.isPlaying = action.payload;
    },
    setCurrentStepIndex: (state, action: PayloadAction<number>) => {
      state.playback.currentStepIndex = Math.max(-1, action.payload);
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playback.speed = Math.max(0.5, Math.min(3.0, action.payload));
    },
    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.reducedMotion = action.payload;
    },
  },
});

export const {
  setMode,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarWidth,
  setPlaybackPlaying,
  setCurrentStepIndex,
  setPlaybackSpeed,
  setReducedMotion,
} = uiSlice.actions;

export default uiSlice.reducer;

