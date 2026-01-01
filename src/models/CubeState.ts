import type { Color, Face } from '../utils/colorUtils';

/**
 * Represents the state of a 3x3x3 Rubik's Cube
 * Each face is a 3x3 grid of colors
 */
export interface CubeState {
  // 6 faces, each with 3x3 grid of colors
  faces: {
    U: Color[][];  // Up (top)
    D: Color[][];  // Down (bottom)
    L: Color[][];  // Left
    R: Color[][];  // Right
    F: Color[][];  // Front
    B: Color[][];  // Back
  };
  // Internal representation for solver compatibility
  cubeString?: string;  // Facelet string representation
}

/**
 * Create a solved cube state
 */
export function createSolvedCubeState(): CubeState {
  const faces: CubeState['faces'] = {
    U: Array(3).fill(null).map(() => Array(3).fill('white' as Color)),
    D: Array(3).fill(null).map(() => Array(3).fill('yellow' as Color)),
    L: Array(3).fill(null).map(() => Array(3).fill('green' as Color)),
    R: Array(3).fill(null).map(() => Array(3).fill('blue' as Color)),
    F: Array(3).fill(null).map(() => Array(3).fill('red' as Color)),
    B: Array(3).fill(null).map(() => Array(3).fill('orange' as Color)),
  };
  
  return { faces };
}

/**
 * Create a deep copy of a cube state
 */
export function cloneCubeState(state: CubeState): CubeState {
  return {
    faces: {
      U: state.faces.U.map(row => [...row]),
      D: state.faces.D.map(row => [...row]),
      L: state.faces.L.map(row => [...row]),
      R: state.faces.R.map(row => [...row]),
      F: state.faces.F.map(row => [...row]),
      B: state.faces.B.map(row => [...row]),
    },
    cubeString: state.cubeString,
  };
}

