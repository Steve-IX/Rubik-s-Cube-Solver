import { useDispatch } from 'react-redux';
import { useState } from 'react';
import type { AppDispatch } from '../../store';
import { setCubeState } from '../../store/slices/cubeSlice';
import { clearHistory, addMove } from '../../store/slices/historySlice';
import { createSolvedCubeState } from '../../models/CubeState';
import { CubeEngine } from '../../engine/CubeEngine';
import { parseMove } from '../../models/Move';
import { faceletStringToCubeState } from '../../solver/solverUtils';
import { SolverWorker } from '../../solver/solverWorker';

const solverWorker = new SolverWorker();

export function ScrambleReset() {
  const dispatch = useDispatch<AppDispatch>();
  const [isScrambling, setIsScrambling] = useState(false);

  const handleScramble = async () => {
    setIsScrambling(true);
    try {
      // Use cubejs to generate scramble for compatibility
      const { faceletString, moves } = await solverWorker.scramble(25);
      
      // Convert facelet string to CubeState
      const scrambledState = faceletStringToCubeState(faceletString);
      
      dispatch(setCubeState(scrambledState));
      dispatch(clearHistory());
      
      // Add all scramble moves to history
      const initialState = createSolvedCubeState();
      let currentState = initialState;
      for (const moveNotation of moves) {
        const move = parseMove(moveNotation, Date.now());
        if (move) {
          currentState = CubeEngine.applyMove(currentState, move);
          dispatch(addMove({ move, state: currentState }));
        }
      }
    } catch (error: any) {
      console.error('Scramble error:', error);
      // Fallback to old scramble method if cubejs scramble fails
      const { scrambleCube } = await import('../../engine/CubeScrambler');
      const initialState = createSolvedCubeState();
      const { scrambledState, scrambleMoves } = scrambleCube(initialState, 25);
      dispatch(setCubeState(scrambledState));
      dispatch(clearHistory());
      let currentState = initialState;
      for (const move of scrambleMoves) {
        currentState = CubeEngine.applyMove(currentState, move);
        dispatch(addMove({ move, state: currentState }));
      }
    } finally {
      setIsScrambling(false);
    }
  };

  const handleReset = () => {
    const resetState = createSolvedCubeState();
    dispatch(setCubeState(resetState));
    dispatch(clearHistory());
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleScramble}
        className="btn-cyber"
        disabled={isScrambling}
        style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}
      >
        <span className="mr-2">🎲</span>
        {isScrambling ? 'Scrambling...' : 'Scramble'}
      </button>
      <button
        onClick={handleReset}
        className="btn-cyber"
      >
        <span className="mr-2">↺</span>
        Reset
      </button>
    </div>
  );
}
