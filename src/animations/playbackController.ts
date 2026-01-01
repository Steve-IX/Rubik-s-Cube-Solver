import type { CubeState } from '../models/CubeState';
import type { SolveStep } from '../models/SolveStep';

/**
 * Playback controller for step-by-step solution execution
 */
export class PlaybackController {
  private currentStepIndex: number = -1;
  private steps: SolveStep[] = [];
  private initialState: CubeState;
  private onStateChange?: (state: CubeState) => void;
  private onStepChange?: (stepIndex: number) => void;

  constructor(
    initialState: CubeState,
    steps: SolveStep[],
    onStateChange?: (state: CubeState) => void,
    onStepChange?: (stepIndex: number) => void
  ) {
    this.initialState = initialState;
    this.steps = steps;
    this.onStateChange = onStateChange;
    this.onStepChange = onStepChange;
  }

  /**
   * Get the cube state at a specific step index
   */
  getStateAtStep(stepIndex: number): CubeState {
    if (stepIndex < 0) {
      return this.initialState;
    }
    if (stepIndex >= this.steps.length) {
      return this.steps[this.steps.length - 1]?.cubeState || this.initialState;
    }
    return this.steps[stepIndex].cubeState;
  }

  /**
   * Go to a specific step
   */
  goToStep(stepIndex: number): CubeState {
    this.currentStepIndex = Math.max(-1, Math.min(stepIndex, this.steps.length - 1));
    const state = this.getStateAtStep(this.currentStepIndex);
    
    if (this.onStateChange) {
      this.onStateChange(state);
    }
    if (this.onStepChange) {
      this.onStepChange(this.currentStepIndex);
    }
    
    return state;
  }

  /**
   * Go to next step
   */
  nextStep(): CubeState | null {
    if (this.currentStepIndex >= this.steps.length - 1) {
      return null;
    }
    return this.goToStep(this.currentStepIndex + 1);
  }

  /**
   * Go to previous step
   */
  previousStep(): CubeState | null {
    if (this.currentStepIndex < 0) {
      return null;
    }
    return this.goToStep(this.currentStepIndex - 1);
  }

  /**
   * Get current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Check if at beginning
   */
  isAtBeginning(): boolean {
    return this.currentStepIndex < 0;
  }

  /**
   * Check if at end
   */
  isAtEnd(): boolean {
    return this.currentStepIndex >= this.steps.length - 1;
  }
}

