import type { Move } from '../models/Move';
import { parseMove } from '../models/Move';

/**
 * Parse a solution string into an array of moves
 */
export function parseSolution(solution: string): Move[] {
  const moves: Move[] = [];
  const tokens = solution.trim().split(/\s+/);
  let timestamp = Date.now();

  for (const token of tokens) {
    const move = parseMove(token, timestamp);
    if (move) {
      moves.push(move);
      timestamp += 100; // Increment timestamp for each move
    }
  }

  return moves;
}

/**
 * Format an array of moves into a solution string
 */
export function formatSolution(moves: Move[]): string {
  return moves.map(m => m.notation).join(' ');
}

