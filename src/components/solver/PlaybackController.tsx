import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  setPlaybackPlaying,
  setCurrentStepIndex,
} from '../../store/slices/uiSlice';
import { setCubeState } from '../../store/slices/cubeSlice';

/**
 * Handles automatic playback of solution steps with proper timing for animations
 */
export function PlaybackControllerComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const playback = useSelector((state: RootState) => state.ui.playback);
  const solveSteps = useSelector((state: RootState) => state.solve.steps);
  const mode = useSelector((state: RootState) => state.ui.mode);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStepTimeRef = useRef<number>(0);

  useEffect(() => {
    // Only auto-play in solve mode
    if (mode !== 'solve') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (playback.isPlaying && solveSteps.length > 0) {
      // Calculate delay based on speed and animation duration
      // Base animation is 350ms, plus a small buffer
      const animationDuration = 350 / playback.speed;
      const delay = animationDuration + 100; // Add buffer for smooth playback

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        
        // Prevent rapid-fire updates
        if (now - lastStepTimeRef.current < delay * 0.8) {
          return;
        }
        
        lastStepTimeRef.current = now;
        
        // Move to next step
        if (playback.currentStepIndex < solveSteps.length - 1) {
          dispatch(setCurrentStepIndex(playback.currentStepIndex + 1));
        } else {
          // Reached the end - stop playback
          dispatch(setPlaybackPlaying(false));
        }
      }, delay);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [playback.isPlaying, playback.speed, playback.currentStepIndex, solveSteps.length, dispatch, mode]);

  // Sync cube state with current step (only for Redux state tracking, not visual display)
  // Note: In solve mode, Cube3D manages its own displayState for animations
  // We only update Redux state when leaving solve mode or when at the final step
  useEffect(() => {
    if (mode === 'solve' && solveSteps.length > 0 && playback.currentStepIndex >= 0) {
      // Only update Redux state when we reach the final step (fully solved)
      // This ensures the cube state is correct when leaving solve mode
      // Don't update when step index is -1 (initial scrambled state)
      if (playback.currentStepIndex === solveSteps.length - 1) {
        const finalStep = solveSteps[playback.currentStepIndex];
        if (finalStep) {
          dispatch(setCubeState(finalStep.cubeState));
        }
      }
      // For all other steps, let Cube3D handle the visual state through animations
    }
  }, [playback.currentStepIndex, solveSteps, mode, dispatch]);

  return null;
}
