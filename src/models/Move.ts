import type { Face } from '../utils/colorUtils';

/**
 * Represents a single move on the Rubik's Cube
 */
export interface Move {
  notation: string;           // "R", "U'", "F2", etc.
  face: Face;                 // Which face to rotate
  direction: number;          // 1, -1, or 2 (90°, -90°, 180°)
  timestamp: number;
  explanation?: string;       // Plain English explanation
}

/**
 * Move notation characters
 */
export const MOVE_NOTATION = {
  CLOCKWISE: '',        // R, U, F, etc.
  COUNTER_CLOCKWISE: "'",  // R', U', F', etc.
  DOUBLE: '2',          // R2, U2, F2, etc.
} as const;

/**
 * Parse a move notation string into a Move object
 */
export function parseMove(notation: string, timestamp: number = Date.now()): Move | null {
  const match = notation.match(/^([UDFBLR])(['2])?$/);
  if (!match) return null;

  const [, face, modifier] = match;
  let direction = 1;

  if (modifier === "'") {
    direction = -1;
  } else if (modifier === '2') {
    direction = 2;
  }

  return {
    notation,
    face: face as Face,
    direction,
    timestamp,
  };
}

/**
 * Format a Move object to notation string
 */
export function formatMove(move: Move): string {
  return move.notation;
}

/**
 * Get plain English explanation for a move
 */
export function getMoveExplanation(move: Move): string {
  const faceNames: Record<Face, string> = {
    U: 'Up (top)',
    D: 'Down (bottom)',
    L: 'Left',
    R: 'Right',
    F: 'Front',
    B: 'Back',
  };

  const directionText = move.direction === 1 
    ? 'clockwise' 
    : move.direction === -1 
    ? 'counter-clockwise' 
    : '180 degrees';

  return `Rotate ${faceNames[move.face]} face ${directionText}`;
}

