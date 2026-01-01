import type { CubeState } from '../models/CubeState';
import type { Color } from './colorUtils';
import { FACE_TO_COLOR } from './colorUtils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate cube state
 */
export function validateCubeState(state: CubeState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count colors
  const colorCounts: Record<Color, number> = {
    white: 0,
    yellow: 0,
    red: 0,
    orange: 0,
    blue: 0,
    green: 0,
  };

  // Check each face
  const faces: Array<keyof CubeState['faces']> = ['U', 'D', 'L', 'R', 'F', 'B'];
  const centerColors: Color[] = [];

  for (const face of faces) {
    const faceColors = state.faces[face];
    
    // Check center sticker
    const centerColor = faceColors[1][1];
    centerColors.push(centerColor);
    
    // Count all colors on this face
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const color = faceColors[row][col];
        colorCounts[color]++;
      }
    }
  }

  // Validate center stickers are unique
  const uniqueCenters = new Set(centerColors);
  if (uniqueCenters.size !== 6) {
    errors.push('Center stickers must be unique (each color must appear exactly once as a center)');
  }

  // Validate each center matches expected face color
  for (const face of faces) {
    const centerColor = state.faces[face][1][1];
    const expectedColor = FACE_TO_COLOR[face];
    if (centerColor !== expectedColor) {
      errors.push(`Face ${face} center should be ${expectedColor}, but is ${centerColor}`);
    }
  }

  // Validate exactly 9 stickers of each color
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count !== 9) {
      errors.push(`Color ${color} appears ${count} times, but should appear exactly 9 times`);
    }
  }

  // Note: Full solvability check (parity) would require more complex logic
  // This is a basic validation - the solver will catch unsolvable states

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

