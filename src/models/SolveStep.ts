import type { CubeState } from './CubeState';
import type { Move } from './Move';

/**
 * Represents a single step in a solution
 */
export interface SolveStep {
  index: number;
  move: Move;
  cubeState: CubeState;       // State after this move
  phase?: 'phase1' | 'phase2'; // Kociemba phase
  algorithm?: boolean;         // Is this an algorithmic step?
}

/**
 * Create a solve step
 */
export function createSolveStep(
  index: number,
  move: Move,
  cubeState: CubeState,
  phase?: 'phase1' | 'phase2',
  algorithm?: boolean
): SolveStep {
  return {
    index,
    move,
    cubeState,
    phase,
    algorithm,
  };
}

