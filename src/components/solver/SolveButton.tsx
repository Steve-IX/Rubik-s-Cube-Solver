import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { startSolving, setSolution, setSolvingError } from '../../store/slices/solveSlice';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { SolverWorker } from '../../solver/solverWorker';
import { solveCube } from '../../solver/mainThreadSolver';
import { parseSolution } from '../../engine/NotationParser';
import { createSolveStep } from '../../models/SolveStep';
import { CubeEngine } from '../../engine/CubeEngine';
import { validateCubeState } from '../../utils/validation';
import { useState, useEffect } from 'react';

const solverWorker = new SolverWorker();

export function SolveButton() {
  const dispatch = useDispatch<AppDispatch>();
  const cubeState = useSelector((state: RootState) => state.cube.currentState);
  const solveStatus = useSelector((state: RootState) => state.solve.status);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Initialize worker asynchronously without blocking
    const init = async () => {
      // Check if workers are supported
      if (typeof Worker === 'undefined') {
        console.error('Web Workers are not supported in this browser');
        return;
      }

      try {
        setIsInitializing(true);
        // Add a small delay to ensure UI is rendered first
        await new Promise(resolve => setTimeout(resolve, 100));
        await solverWorker.initialize();
        console.log('Solver worker initialized successfully');
      } catch (error: any) {
        console.error('Failed to initialize solver worker:', error);
        // Don't set error state here - let the solve button handle it
      } finally {
        setIsInitializing(false);
      }
    };
    
    // Initialize after a brief delay to not block initial render
    const timeoutId = setTimeout(init, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSolve = async () => {
    try {
      // Validate cube state before attempting to solve
      const validation = validateCubeState(cubeState);
      if (!validation.isValid) {
        const errorMessage = `Invalid cube state: ${validation.errors.join('; ')}`;
        console.error('Cube validation failed:', validation);
        dispatch(setSolvingError(errorMessage));
        return;
      }

      dispatch(startSolving(cubeState));
      dispatch(setSidebarOpen(true));

      let solution: string;

      // Check if workers are supported
      if (typeof Worker === 'undefined') {
        throw new Error('Web Workers are not supported in this browser. The solver cannot run without Web Workers as it would freeze the page.');
      }

      // Check if worker is available before attempting to use it
      if (!solverWorker.isAvailable()) {
        // Try to initialize one more time
        try {
          console.log('Worker not initialized, attempting initialization...');
          await solverWorker.initialize();
        } catch (initError: any) {
          throw new Error(`Web Worker is not available: ${initError?.message || 'Initialization failed'}. The cubejs solver requires a Web Worker to prevent freezing the page. Please check your browser settings or try refreshing the page.`);
        }
      }

      // Try to use worker
      try {
        console.log('Attempting to solve using worker...');
        const result = await solverWorker.solve(cubeState);
        solution = result.solution;
        console.log('Solve completed using worker');
      } catch (workerError: any) {
        console.error('Worker solve failed:', workerError);
        
        // Check if it's a timeout error - this usually means the cube state is invalid
        const errorMessage = workerError?.message || 'Unknown error';
        if (errorMessage.includes('timeout')) {
          throw new Error(`Solve timed out after 120 seconds. This usually means the cube state is invalid or unsolvable. Please check that: 1) Each color appears exactly 9 times, 2) Center pieces match their face colors, 3) The cube hasn't been physically disassembled and reassembled incorrectly. Try scrambling the cube again or resetting to a solved state.`);
        }
        
        // Don't fall back to main thread - it will freeze the page
        // Instead, provide a clear error message
        throw new Error(`Solver worker failed: ${errorMessage}. The cubejs library may not be compatible with Web Workers in your browser. Please try refreshing the page or check the browser console for more details.`);
      }

      // Parse and process the solution
      const moveObjects = parseSolution(solution);

      const steps = [];
      let currentState = cubeState;
      for (let i = 0; i < moveObjects.length; i++) {
        const move = moveObjects[i];
        currentState = CubeEngine.applyMove(currentState, move);
        steps.push(createSolveStep(i, move, currentState));
      }

      dispatch(
        setSolution({
          steps,
          solutionString: solution,
        })
      );
    } catch (error: any) {
      console.error('Solve error:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to solve cube';
      dispatch(setSolvingError(errorMessage));
    }
  };

  const isSolving = solveStatus === 'solving';
  const isSolved = solveStatus === 'solved';

  return (
    <button
      onClick={handleSolve}
      disabled={isSolving || isInitializing}
      className="relative px-6 py-2 rounded overflow-hidden transition-all duration-300 group"
      style={{
        background: isSolving 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'var(--gradient-primary)',
        border: isSolving ? '1px solid var(--accent-primary)' : 'none',
        color: isSolving ? 'var(--accent-primary)' : 'var(--bg-primary)',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        boxShadow: isSolving ? 'none' : '0 0 12px rgba(59, 130, 246, 0.2)',
        opacity: isInitializing ? 0.5 : 1,
        cursor: isInitializing || isSolving ? 'not-allowed' : 'pointer',
      }}
    >
      {/* Animated shine effect */}
      {!isSolving && !isInitializing && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shine 1.5s infinite',
          }}
        />
      )}
      
      <span className="relative flex items-center gap-2">
        {isSolving && (
          <svg 
            className="animate-spin" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" opacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        )}
        {!isSolving && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        )}
        <span>
          {isInitializing
            ? 'Loading...'
            : isSolving
            ? 'Computing...'
            : isSolved
            ? 'Solve Again'
            : 'Solve Cube'}
        </span>
      </span>
    </button>
  );
}
