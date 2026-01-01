import type { CubeState } from '../models/CubeState';
import type { Face } from '../utils/colorUtils';

/**
 * Convert CubeState to cubejs facelet string format
 * 
 * cubejs expects facelet string in order: U R F D L B
 * Each face has 9 positions (1-9) read left-to-right, top-to-bottom in the net view.
 * 
 * CRITICAL: Our face arrays use a coordinate system where Cube3D applies transformations:
 * - U: U[2-z][x] - front row (z=2) maps to row 0, back row (z=0) maps to row 2
 * - D: D[z][2-x] - similar but different axis orientation
 * - etc.
 * 
 * For cubejs, the "top" of each face in the net diagram corresponds to specific
 * 3D orientations. We need to read faces in the order that matches cubejs's net layout.
 * 
 * Reference: https://github.com/hkociemba/RubiksCube-TwophaseSolver
 */
export function cubeStateToFaceletString(state: CubeState): string {
  let faceletString = '';

  // U face: In our system, row 2 is back (near B), row 0 is front (near F)
  // cubejs expects back row first (positions 1-3), front row last (7-9)
  // So we read row 2, row 1, row 0
  for (let row = 2; row >= 0; row--) {
    for (let col = 0; col < 3; col++) {
      faceletString += colorToFaceletChar(state.faces.U[row][col]);
    }
  }

  // R face: In our system, row 0 is back (near B), row 2 is front (near F)
  // cubejs expects the top of R (near U) first
  // Based on R[z][2-y], when z=0 (back), y=2 (top) → R[0][0]
  // cubejs R1 should be back-top, R3 should be front-top
  // Read row 0 (back) to row 2 (front), but columns reversed (2-y means col 2 = y=0 = bottom)
  // Actually, let's try reading R face with rows in order but columns reversed
  for (let row = 0; row < 3; row++) {
    for (let col = 2; col >= 0; col--) {
      faceletString += colorToFaceletChar(state.faces.R[row][col]);
    }
  }

  // F face: In our system, row 0 is top (near U), row 2 is bottom (near D)
  // Based on F[2-y][x], when y=2 (top), row = 0
  // cubejs expects top row first, which matches row 0 first
  // Standard reading should work
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      faceletString += colorToFaceletChar(state.faces.F[row][col]);
    }
  }

  // D face: In our system, based on D[z][2-x]
  // When z=0 (back), x=0 (left) → D[0][2]
  // cubejs D1 should be back-left (near B and L)
  // Read rows in order but columns reversed
  for (let row = 0; row < 3; row++) {
    for (let col = 2; col >= 0; col--) {
      faceletString += colorToFaceletChar(state.faces.D[row][col]);
    }
  }

  // L face: In our system, based on L[2-z][2-y]
  // When z=2 (front), y=2 (top) → L[0][0]
  // cubejs L1 should be back-top (near U and B)
  // Need to read rows reversed, columns reversed
  for (let row = 2; row >= 0; row--) {
    for (let col = 2; col >= 0; col--) {
      faceletString += colorToFaceletChar(state.faces.L[row][col]);
    }
  }

  // B face: In our system, based on B[2-y][2-x]
  // When y=2 (top), x=0 (left when looking at B) → B[0][2]
  // cubejs B1 should be top-left when looking at B from outside
  // Need to read rows in order, columns reversed
  for (let row = 0; row < 3; row++) {
    for (let col = 2; col >= 0; col--) {
      faceletString += colorToFaceletChar(state.faces.B[row][col]);
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
 * Parse solution string from cubejs format to Move array
 */
export function parseSolutionString(solution: string): string[] {
  // cubejs returns moves in standard notation like "R U R' U' R' F R F'"
  return solution.trim().split(/\s+/).filter(m => m.length > 0);
}

