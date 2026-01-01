import type { CubeState } from '../models/CubeState';
import { cubeStateToFaceletString, parseSolutionString, validateFaceletString } from './solverUtils';

// Import cubejs
// @ts-ignore
import Cube from 'cubejs';

let solverInitialized = false;

/**
 * Initialize the cubejs solver (only needs to be called once)
 */
export async function initializeSolver(): Promise<void> {
  if (solverInitialized) {
    return;
  }

  if (!Cube) {
    throw new Error('cubejs library not loaded');
  }

  if (typeof Cube.initSolver !== 'function') {
    throw new Error('cubejs.initSolver method not available');
  }

  // Yield to allow UI to update before potentially blocking initialization
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => resolve(), 0);
      });
    } else {
      setTimeout(() => resolve(), 0);
    }
  });

  await Cube.initSolver();
  solverInitialized = true;
}

/**
 * Solve a cube state (runs on main thread)
 */
export async function solveCube(cubeState: CubeState): Promise<{ solution: string; moves: string[] }> {
  // Initialize if needed
  if (!solverInitialized) {
    await initializeSolver();
  }

  if (!cubeState || !cubeState.faces) {
    throw new Error('Invalid cube state provided');
  }

  const faceletString = cubeStateToFaceletString(cubeState);

  // Validate facelet string format
  const validation = validateFaceletString(faceletString);
  if (!validation.isValid) {
    throw new Error(`Invalid facelet string: ${validation.error}`);
  }

  // Create cube from facelet string
  if (!Cube.fromString) {
    throw new Error('cubejs.fromString method not available');
  }

  let cube;
  try {
    cube = Cube.fromString(faceletString);
  } catch (parseError: any) {
    throw new Error(`Failed to parse cube state: ${parseError.message || 'Invalid facelet string'}`);
  }

  // Solve the cube
  if (!cube.solve) {
    throw new Error('cube.solve method not available');
  }

  let solution: string;
  try {
    // Yield to the event loop to allow UI to update before blocking solve
    await new Promise<void>((resolve) => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          setTimeout(() => {
            resolve();
          }, 0);
        });
      } else {
        setTimeout(() => {
          resolve();
        }, 0);
      }
    });
    
    // Run solve in a way that yields control periodically
    // Since cube.solve() is synchronous, we need to run it in chunks
    // We'll use a Promise that resolves after the solve completes
    // This at least allows the UI to update before the blocking operation
    solution = await new Promise<string>((resolve, reject) => {
      try {
        // Use setTimeout to defer the solve, giving the browser a chance to update UI
        setTimeout(() => {
          try {
            // The solve operation is synchronous and blocking
            // We can't break it up, but at least we've yielded control once
            const result = cube.solve();
            resolve(result);
          } catch (solveError: any) {
            reject(new Error(`Failed to solve cube: ${solveError.message || 'Solver error'}`));
          }
        }, 10); // Small delay to allow UI to update
      } catch (error: any) {
        reject(new Error(`Failed to solve cube: ${error.message || 'Solver error'}`));
      }
    });
  } catch (solveError: any) {
    throw new Error(`Failed to solve cube: ${solveError.message || 'Solver error'}`);
  }

  if (!solution || typeof solution !== 'string') {
    throw new Error('Solver returned invalid solution');
  }

  // Parse solution
  const moves = parseSolutionString(solution);

  return {
    solution,
    moves,
  };
}

