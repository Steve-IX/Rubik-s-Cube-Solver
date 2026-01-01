import type { Move } from '../models/Move';
import type { Face } from '../utils/colorUtils';

/**
 * Validate a move is legal
 */
export function isValidMove(move: Move): boolean {
  // Check face is valid
  const validFaces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
  if (!validFaces.includes(move.face)) {
    return false;
  }

  // Check direction is valid (-1, 1, or 2)
  if (![-1, 1, 2].includes(move.direction)) {
    return false;
  }

  // Check notation matches
  const expectedNotation = formatMoveNotation(move.face, move.direction);
  if (move.notation !== expectedNotation) {
    return false;
  }

  return true;
}

/**
 * Format move notation from face and direction
 */
export function formatMoveNotation(face: Face, direction: number): string {
  if (direction === 1) return face;
  if (direction === -1) return `${face}'`;
  if (direction === 2) return `${face}2`;
  return face;
}

