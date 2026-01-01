import type { CubeState } from './CubeState';
import type { SolveStep } from './SolveStep';

/**
 * Represents a complete solve session
 */
export interface SolveSession {
  id: string;
  initialState: CubeState;
  steps: SolveStep[];
  status: 'idle' | 'solving' | 'solved' | 'error';
  solutionString?: string;    // Raw solver output
  error?: string;             // Error message if status is 'error'
}

/**
 * Create a new solve session
 */
export function createSolveSession(initialState: CubeState): SolveSession {
  return {
    id: crypto.randomUUID(),
    initialState,
    steps: [],
    status: 'idle',
  };
}

