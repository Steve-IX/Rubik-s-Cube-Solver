import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { AppDispatch, RootState } from '../../store';
import {
  setPlaybackPlaying,
  setCurrentStepIndex,
} from '../../store/slices/uiSlice';

export function SolveControls() {
  const dispatch = useDispatch<AppDispatch>();
  const playback = useSelector((state: RootState) => state.ui.playback);
  const solveSteps = useSelector((state: RootState) => state.solve.steps);
  const mode = useSelector((state: RootState) => state.ui.mode);

  useEffect(() => {
    if (mode !== 'solve') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          dispatch(setPlaybackPlaying(!playback.isPlaying));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (playback.currentStepIndex > 0) {
            dispatch(setCurrentStepIndex(playback.currentStepIndex - 1));
            dispatch(setPlaybackPlaying(false));
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (playback.currentStepIndex < solveSteps.length - 1) {
            dispatch(setCurrentStepIndex(playback.currentStepIndex + 1));
            dispatch(setPlaybackPlaying(false));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, playback.isPlaying, playback.currentStepIndex, solveSteps.length, mode]);

  const canGoPrevious = playback.currentStepIndex > 0;
  const canGoNext = playback.currentStepIndex < solveSteps.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      dispatch(setCurrentStepIndex(playback.currentStepIndex - 1));
      dispatch(setPlaybackPlaying(false));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      dispatch(setCurrentStepIndex(playback.currentStepIndex + 1));
      dispatch(setPlaybackPlaying(false));
    }
  };

  const handlePlayPause = () => {
    dispatch(setPlaybackPlaying(!playback.isPlaying));
  };

  const handleFirst = () => {
    dispatch(setCurrentStepIndex(0));
    dispatch(setPlaybackPlaying(false));
  };

  const handleLast = () => {
    dispatch(setCurrentStepIndex(solveSteps.length - 1));
    dispatch(setPlaybackPlaying(false));
  };

  const buttonStyle = (enabled: boolean, primary = false) => ({
    background: primary 
      ? 'var(--gradient-primary)' 
      : enabled 
      ? 'rgba(59, 130, 246, 0.1)' 
      : 'rgba(100, 116, 139, 0.05)',
    color: primary 
      ? 'var(--bg-primary)' 
      : enabled 
      ? 'var(--accent-primary)' 
      : 'var(--text-muted)',
    border: primary ? 'none' : '1px solid',
    borderColor: enabled ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.1)',
    cursor: enabled || primary ? 'pointer' : 'not-allowed',
    opacity: enabled || primary ? 1 : 0.5,
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleFirst}
        disabled={!canGoPrevious}
        className="p-2 rounded transition-all duration-200"
        style={buttonStyle(canGoPrevious)}
        aria-label="First move"
        title="Go to first move"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="11,17 6,12 11,7" />
          <polyline points="18,17 13,12 18,7" />
        </svg>
      </button>
      
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="p-2 rounded transition-all duration-200"
        style={buttonStyle(canGoPrevious)}
        aria-label="Previous move"
        title="Previous move (←)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
      
      <button
        onClick={handlePlayPause}
        className="p-3 rounded transition-all duration-200"
        style={{
          ...buttonStyle(true, true),
          boxShadow: playback.isPlaying ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none',
        }}
        aria-label={playback.isPlaying ? 'Pause' : 'Play'}
        title={playback.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {playback.isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
      
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="p-2 rounded transition-all duration-200"
        style={buttonStyle(canGoNext)}
        aria-label="Next move"
        title="Next move (→)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
      
      <button
        onClick={handleLast}
        disabled={!canGoNext}
        className="p-2 rounded transition-all duration-200"
        style={buttonStyle(canGoNext)}
        aria-label="Last move"
        title="Go to last move"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="13,17 18,12 13,7" />
          <polyline points="6,17 11,12 6,7" />
        </svg>
      </button>
    </div>
  );
}
