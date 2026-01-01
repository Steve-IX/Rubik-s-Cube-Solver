import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setCubeState } from '../../store/slices/cubeSlice';
import { clearHistory, addMove } from '../../store/slices/historySlice';
import { scrambleCube } from '../../engine/CubeScrambler';
import { createSolvedCubeState } from '../../models/CubeState';
import { CubeEngine } from '../../engine/CubeEngine';

export function ScrambleReset() {
  const dispatch = useDispatch<AppDispatch>();

  const handleScramble = () => {
    const initialState = createSolvedCubeState();
    const { scrambledState, scrambleMoves } = scrambleCube(initialState, 25);
    dispatch(setCubeState(scrambledState));
    dispatch(clearHistory());
    // Add all scramble moves to history
    let currentState = initialState;
    for (const move of scrambleMoves) {
      currentState = CubeEngine.applyMove(currentState, move);
      dispatch(addMove({ move, state: currentState }));
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
        style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}
      >
        <span className="mr-2">🎲</span>
        Scramble
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
