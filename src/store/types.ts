import type { CubeState } from '../models/CubeState';
import type { Move } from '../models/Move';
import type { SolveSession } from '../models/SolveSession';
import type { UIState } from '../models/UIState';

/**
 * Root state type
 */
export interface RootState {
  cube: {
    currentState: CubeState;
  };
  ui: UIState;
  solve: SolveSession;
  history: {
    past: Array<{ move: Move; state: CubeState }>;
    future: Array<{ move: Move; state: CubeState }>;
    maxHistory: number;
  };
}
