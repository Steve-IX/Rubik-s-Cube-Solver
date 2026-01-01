import type { CubeState } from '../models/CubeState';
import type { Move } from '../models/Move';
import { parseMove } from '../models/Move';
import type { Face } from '../utils/colorUtils';
import { CubeEngine } from './CubeEngine';

/**
 * Generate a random scramble sequence
 */
export function generateScramble(length: number = 25): Move[] {
  const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
  const directions = [1, -1, 2]; // clockwise, counter-clockwise, double
  const moves: Move[] = [];
  let timestamp = Date.now();

  let lastFace: Face | null = null;

  for (let i = 0; i < length; i++) {
    // Avoid same face twice in a row
    let face: Face;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);

    lastFace = face;
    const direction = directions[Math.floor(Math.random() * directions.length)];

    const notation = direction === 1 
      ? face 
      : direction === -1 
      ? `${face}'` 
      : `${face}2`;

    const move = parseMove(notation, timestamp);
    if (move) {
      moves.push(move);
      timestamp += 100;
    }
  }

  return moves;
}

/**
 * Apply a scramble to a cube state
 */
export function scrambleCube(state: CubeState, length: number = 25): {
  scrambledState: CubeState;
  scrambleMoves: Move[];
} {
  const scrambleMoves = generateScramble(length);
  const scrambledState = CubeEngine.applyMoves(state, scrambleMoves);
  return { scrambledState, scrambleMoves };
}

