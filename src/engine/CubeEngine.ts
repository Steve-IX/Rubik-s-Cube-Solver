import type { CubeState } from '../models/CubeState';
import { cloneCubeState } from '../models/CubeState';
import type { Move } from '../models/Move';
import type { Face } from '../utils/colorUtils';

/**
 * Core cube manipulation engine
 * Handles all face rotations and state updates
 */
export class CubeEngine {
  /**
   * Apply a move to the cube state
   */
  static applyMove(state: CubeState, move: Move): CubeState {
    const newState = cloneCubeState(state);
    
    // Apply rotation based on direction
    if (move.direction === 2) {
      // 180 degree rotation = two 90 degree rotations
      this.rotateFace90(newState, move.face);
      this.rotateFace90(newState, move.face);
    } else if (move.direction === 1) {
      // Clockwise 90 degrees
      this.rotateFace90(newState, move.face);
    } else if (move.direction === -1) {
      // Counter-clockwise 90 degrees = three clockwise rotations
      this.rotateFace90(newState, move.face);
      this.rotateFace90(newState, move.face);
      this.rotateFace90(newState, move.face);
    }
    
    return newState;
  }

  /**
   * Rotate a face 90 degrees clockwise
   */
  private static rotateFace90(state: CubeState, face: Face): void {
    // Rotate the face itself
    this.rotateFaceMatrix(state.faces[face]);

    // Rotate adjacent edges and corners
    switch (face) {
      case 'U':
        this.rotateUpFace(state);
        break;
      case 'D':
        this.rotateDownFace(state);
        break;
      case 'L':
        this.rotateLeftFace(state);
        break;
      case 'R':
        this.rotateRightFace(state);
        break;
      case 'F':
        this.rotateFrontFace(state);
        break;
      case 'B':
        this.rotateBackFace(state);
        break;
    }
  }

  /**
   * Rotate a 3x3 matrix 90 degrees clockwise
   */
  private static rotateFaceMatrix(face: import('../utils/colorUtils').Color[][]): void {
    // Transpose and reverse each row
    const n = face.length;
    // Transpose
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        [face[i][j], face[j][i]] = [face[j][i], face[i][j]];
      }
    }
    // Reverse each row
    for (let i = 0; i < n; i++) {
      face[i].reverse();
    }
  }

  /**
   * Rotate Up face - affects F, R, B, L top rows
   * When U rotates clockwise (looking from above):
   * - F top row → R top row → B top row (reversed) → L top row (reversed) → F top row
   * Note: B and L need reversal because they face away
   */
  private static rotateUpFace(state: CubeState): void {
    const fTop = [...state.faces.F[0]];
    const rTop = [...state.faces.R[0]];
    const bTop = [...state.faces.B[0]];
    const lTop = [...state.faces.L[0]];

    // Rotate clockwise: F → R → B (reversed) → L (reversed) → F
    state.faces.F[0] = [...lTop].reverse();
    state.faces.R[0] = fTop;
    state.faces.B[0] = [...rTop].reverse();
    state.faces.L[0] = bTop;
  }

  /**
   * Rotate Down face - affects F, R, B, L bottom rows
   * When D rotates clockwise (looking from below):
   * - F bottom row → L bottom row → B bottom row (reversed) → R bottom row (reversed) → F bottom row
   * Note: B and R need reversal because they face away
   */
  private static rotateDownFace(state: CubeState): void {
    const fBottom = [...state.faces.F[2]];
    const lBottom = [...state.faces.L[2]];
    const bBottom = [...state.faces.B[2]];
    const rBottom = [...state.faces.R[2]];

    // Rotate clockwise: F → L → B (reversed) → R (reversed) → F
    state.faces.F[2] = [...rBottom].reverse();
    state.faces.L[2] = fBottom;
    state.faces.B[2] = [...lBottom].reverse();
    state.faces.R[2] = bBottom;
  }

  /**
   * Rotate Left face - affects U, F, D, B columns
   * When L rotates clockwise (looking at L):
   * - U left column → F left column
   * - F left column → D left column
   * - D left column → B right column (reversed)
   * - B right column (reversed) → U left column (reversed)
   */
  private static rotateLeftFace(state: CubeState): void {
    // Extract left column from each face
    const uLeft = [state.faces.U[0][0], state.faces.U[1][0], state.faces.U[2][0]];
    const fLeft = [state.faces.F[0][0], state.faces.F[1][0], state.faces.F[2][0]];
    const dLeft = [state.faces.D[0][0], state.faces.D[1][0], state.faces.D[2][0]];
    const bRight = [state.faces.B[2][2], state.faces.B[1][2], state.faces.B[0][2]]; // B right column reversed

    // Rotate clockwise: U left → F left → D left → B right (reversed) → U left (reversed)
    for (let i = 0; i < 3; i++) {
      state.faces.U[i][0] = bRight[i];  // B right (reversed) → U left (reversed)
      state.faces.F[i][0] = uLeft[i];   // U left → F left
      state.faces.D[i][0] = fLeft[i];   // F left → D left
      state.faces.B[2 - i][2] = dLeft[i]; // D left → B right (reversed)
    }
  }

  /**
   * Rotate Right face - affects U, B, D, F right columns
   * When R rotates clockwise (looking at R):
   * - U right column → B left column (reversed)
   * - B left column → D right column
   * - D right column → F right column
   * - F right column → U right column
   */
  private static rotateRightFace(state: CubeState): void {
    // Extract right column from each face
    const uRight = [state.faces.U[0][2], state.faces.U[1][2], state.faces.U[2][2]];
    const bLeft = [state.faces.B[2][0], state.faces.B[1][0], state.faces.B[0][0]]; // B left column reversed
    const dRight = [state.faces.D[0][2], state.faces.D[1][2], state.faces.D[2][2]];
    const fRight = [state.faces.F[0][2], state.faces.F[1][2], state.faces.F[2][2]];

    // Rotate clockwise: U right → B left (reversed) → D right → F right → U right
    for (let i = 0; i < 3; i++) {
      state.faces.U[i][2] = fRight[i];   // F right → U right
      state.faces.B[2 - i][0] = uRight[i]; // U right → B left (reversed)
      state.faces.D[i][2] = bLeft[i];    // B left → D right
      state.faces.F[i][2] = dRight[i];   // D right → F right
    }
  }

  /**
   * Rotate Front face - affects U bottom, R left, D top, L right
   * When F rotates clockwise (looking at F):
   * - U bottom row → R left column
   * - R left column → D top row (reversed)
   * - D top row → L right column
   * - L right column → U bottom row (reversed)
   */
  private static rotateFrontFace(state: CubeState): void {
    const uBottom = [...state.faces.U[2]];
    const rLeft = [state.faces.R[0][0], state.faces.R[1][0], state.faces.R[2][0]];
    const dTop = [...state.faces.D[0]];
    const lRight = [state.faces.L[0][2], state.faces.L[1][2], state.faces.L[2][2]];

    // Rotate clockwise: U bottom → R left → D top (reversed) → L right → U bottom (reversed)
    for (let i = 0; i < 3; i++) {
      state.faces.R[i][0] = uBottom[i];
    }
    state.faces.D[0] = [...rLeft].reverse();
    for (let i = 0; i < 3; i++) {
      state.faces.L[i][2] = dTop[i];
    }
    state.faces.U[2] = [...lRight].reverse();
  }

  /**
   * Rotate Back face - affects U top, R right, D bottom, L left
   * When B rotates clockwise (looking at B):
   * - U top row → R right column
   * - R right column → D bottom row (reversed)
   * - D bottom row → L left column
   * - L left column → U top row (reversed)
   */
  private static rotateBackFace(state: CubeState): void {
    const uTop = [...state.faces.U[0]];
    const rRight = [state.faces.R[0][2], state.faces.R[1][2], state.faces.R[2][2]];
    const dBottom = [...state.faces.D[2]];
    const lLeft = [state.faces.L[0][0], state.faces.L[1][0], state.faces.L[2][0]];

    // Rotate clockwise: U top → R right → D bottom (reversed) → L left → U top (reversed)
    for (let i = 0; i < 3; i++) {
      state.faces.R[i][2] = uTop[i];
    }
    state.faces.D[2] = [...rRight].reverse();
    for (let i = 0; i < 3; i++) {
      state.faces.L[i][0] = dBottom[i];
    }
    state.faces.U[0] = [...lLeft].reverse();
  }

  /**
   * Apply multiple moves in sequence
   */
  static applyMoves(state: CubeState, moves: Move[]): CubeState {
    let currentState = cloneCubeState(state);
    for (const move of moves) {
      currentState = this.applyMove(currentState, move);
    }
    return currentState;
  }
}

