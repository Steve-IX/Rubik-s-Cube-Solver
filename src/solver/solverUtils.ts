import type { CubeState } from '../models/CubeState';
import type { Face } from '../utils/colorUtils';

/**
 * Convert CubeState to cubejs facelet string format
 * 
 * cubejs expects facelet string in order: U R F D L B
 * Each face has 9 positions (1-9) read left-to-right, top-to-bottom.
 * 
 * Since the solved cube works with standard row-by-row reading (row 0, row 1, row 2),
 * we use that same approach for all faces. The face arrays are stored in the format
 * that cubejs expects when reading directly.
 * 
 * Reference: https://github.com/hkociemba/RubiksCube-TwophaseSolver
 */
export function cubeStateToFaceletString(state: CubeState): string {
  // cubejs facelet order: U R F D L B (9 stickers each, 54 total)
  const faces: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  let faceletString = '';

  for (const face of faces) {
    const faceColors = state.faces[face];
    
    // Read face in standard order: row by row (0, 1, 2), left to right (0, 1, 2)
    // This matches the solved cube format and should work for all states
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        faceletString += colorToFaceletChar(faceColors[row][col]);
      }
    }
  }

  return faceletString;
}

/**
 * Convert color to cubejs facelet character
 * cubejs expects facelet characters that represent which face the sticker belongs to
 * based on the standard color scheme: white=U, yellow=D, red=F, orange=B, blue=R, green=L
 */
function colorToFaceletChar(color: string): string {
  const mapping: Record<string, string> = {
    white: 'U',
    yellow: 'D',
    red: 'F',
    orange: 'B',
    blue: 'R',
    green: 'L',
  };
  const result = mapping[color];
  if (!result) {
    console.warn(`Unknown color "${color}", defaulting to 'U'`);
    return 'U';
  }
  return result;
}

/**
 * Validate facelet string format
 * Should be exactly 54 characters, each character should be U, R, F, D, L, or B
 */
export function validateFaceletString(faceletString: string): { isValid: boolean; error?: string } {
  if (faceletString.length !== 54) {
    return {
      isValid: false,
      error: `Facelet string must be exactly 54 characters, got ${faceletString.length}`,
    };
  }
  
  const validChars = /^[URFDLB]{54}$/;
  if (!validChars.test(faceletString)) {
    const invalidChars = [...new Set(faceletString.split('').filter(c => !/[URFDLB]/.test(c)))];
    return {
      isValid: false,
      error: `Facelet string contains invalid characters: ${invalidChars.join(', ')}. Only U, R, F, D, L, B are allowed.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Convert cubejs facelet character to color
 */
function faceletCharToColor(char: string): import('../utils/colorUtils').Color {
  const mapping: Record<string, import('../utils/colorUtils').Color> = {
    U: 'white',
    D: 'yellow',
    F: 'red',
    B: 'orange',
    R: 'blue',
    L: 'green',
  };
  return mapping[char] || 'white';
}

/**
 * Convert cubejs facelet string to CubeState
 * This is the inverse of cubeStateToFaceletString
 */
export function faceletStringToCubeState(faceletString: string): CubeState {
  if (faceletString.length !== 54) {
    throw new Error(`Facelet string must be exactly 54 characters, got ${faceletString.length}`);
  }

  const faces: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  const cubeState: CubeState = {
    faces: {
      U: Array(3).fill(null).map(() => Array(3).fill(null)),
      R: Array(3).fill(null).map(() => Array(3).fill(null)),
      F: Array(3).fill(null).map(() => Array(3).fill(null)),
      D: Array(3).fill(null).map(() => Array(3).fill(null)),
      L: Array(3).fill(null).map(() => Array(3).fill(null)),
      B: Array(3).fill(null).map(() => Array(3).fill(null)),
    },
  };

  let index = 0;
  for (const face of faces) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const char = faceletString[index++];
        cubeState.faces[face][row][col] = faceletCharToColor(char);
      }
    }
  }

  return cubeState;
}

/**
 * Parse solution string from cubejs format to Move array
 */
export function parseSolutionString(solution: string): string[] {
  // cubejs returns moves in standard notation like "R U R' U' R' F R F'"
  return solution.trim().split(/\s+/).filter(m => m.length > 0);
}

