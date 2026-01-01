import type { AppDispatch } from '../store';
import { setMode } from '../store/slices/uiSlice';
import type { AppMode } from '../models/UIState';
import {
  setPlaybackPlaying,
  setCurrentStepIndex,
} from '../store/slices/uiSlice';
import { resetCube } from '../store/slices/cubeSlice';
import { clearHistory } from '../store/slices/historySlice';

/**
 * Setup keyboard shortcuts for the application
 */
export function setupKeyboardShortcuts(dispatch: AppDispatch) {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if typing in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    switch (event.key) {
      case ' ': // Space - Play/Pause
        event.preventDefault();
        // Only in solve mode - toggle playback
        // Note: This requires getting current state, which would need to be passed in
        break;

      case 'ArrowLeft': // Previous step
        event.preventDefault();
        // Note: This requires getting current index, which would need to be passed in
        dispatch(setPlaybackPlaying(false));
        break;

      case 'ArrowRight': // Next step
        event.preventDefault();
        // Note: This requires getting current index, which would need to be passed in
        dispatch(setPlaybackPlaying(false));
        break;

      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          return; // Allow Ctrl+R / Cmd+R for refresh
        }
        event.preventDefault();
        dispatch(resetCube());
        dispatch(clearHistory());
        break;

      case 's':
      case 'S':
        if (event.ctrlKey || event.metaKey) {
          return; // Allow Ctrl+S / Cmd+S for save
        }
        event.preventDefault();
        // Scramble - this would need to be connected to scramble action
        break;

      case 'Escape':
        event.preventDefault();
        dispatch(setMode('play'));
        break;

      case '1':
        event.preventDefault();
        dispatch(setMode('play' as AppMode));
        break;

      case '2':
        event.preventDefault();
        dispatch(setMode('mapping' as AppMode));
        break;

      case '3':
        event.preventDefault();
        dispatch(setMode('solve' as AppMode));
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

