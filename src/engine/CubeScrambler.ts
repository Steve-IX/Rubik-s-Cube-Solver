import type { CubeState } from '../models/CubeState';
import type { Move } from '../models/Move';
import { parseMove } from '../models/Move';
import type { Face } from '../utils/colorUtils';
import { CubeEngine } from './CubeEngine';
import { faceletStringToCubeState } from '../solver/solverUtils';

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
 * Apply a scramble to a cube state using our CubeEngine
 * NOTE: This may produce cube states that don't match cubejs's coordinate system
 */
export function scrambleCube(state: CubeState, length: number = 25): {
  scrambledState: CubeState;
  scrambleMoves: Move[];
} {
  const scrambleMoves = generateScramble(length);
  const scrambledState = CubeEngine.applyMoves(state, scrambleMoves);
  return { scrambledState, scrambleMoves };
}

/**
 * Generate a scrambled cube state using cubejs for compatibility
 * This ensures the scrambled state is compatible with cubejs's solver
 * 
 * @param cubejsInstance - Initialized cubejs instance
 * @param length - Number of scramble moves (default: 25)
 * @returns Scrambled cube state and the scramble moves
 */
export async function scrambleCubeWithCubejs(
  cubejsInstance: any,
  length: number = 25
): Promise<{
  scrambledState: CubeState;
  scrambleMoves: Move[];
  faceletString: string;
}> {
  // Create a solved cube using cubejs
  const solvedCube = new cubejsInstance();
  
  // Generate scramble using cubejs's scramble method
  if (cubejsInstance.scramble && typeof cubejsInstance.scramble === 'function') {
    const scrambleString = cubejsInstance.scramble(length);
    const scrambleMoveStrings = parseScrambleString(scrambleString);
    
    // Convert move strings to Move objects
    const scrambleMoves: Move[] = [];
    let timestamp = Date.now();
    for (const moveStr of scrambleMoveStrings) {
      const move = parseMove(moveStr, timestamp);
      if (move) {
        scrambleMoves.push(move);
        timestamp += 100;
      }
    }
    
    // Apply scramble to solved cube
    const scrambledCube = new cubejsInstance();
    for (const moveStr of scrambleMoveStrings) {
      scrambledCube.move(moveStr);
    }
    
    // Get facelet string from scrambled cube
    const faceletString = scrambledCube.asString();
    
    // Convert to our CubeState format
    const scrambledState = faceletStringToCubeState(faceletString);
    
    return { scrambledState, scrambleMoves, faceletString };
  } else {
    // Fallback: use manual scrambling
    const scrambledCube = new cubejsInstance();
    const moves: string[] = [];
    
    // Generate random moves
    const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const directions = ['', "'", '2'];
    let lastFace: Face | null = null;
    
    for (let i = 0; i < length; i++) {
      let face: Face;
      do {
        face = faces[Math.floor(Math.random() * faces.length)];
      } while (face === lastFace);
      
      lastFace = face;
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const move = face + direction;
      
      scrambledCube.move(move);
      moves.push(move);
    }
    
    const faceletString = scrambledCube.asString();
    const scrambledState = faceletStringToCubeState(faceletString);
    const scrambleMoves = moves.map((m, i) => parseMove(m, Date.now() + i * 100)).filter((m): m is Move => m !== null);
    
    return { scrambledState, scrambleMoves, faceletString };
  }
}

/**
 * Parse scramble string from cubejs format to Move array
 */
function parseScrambleString(scramble: string): string[] {
  return scramble.trim().split(/\s+/).filter(m => m.length > 0);
}

