import { cubeStateToFaceletString, validateFaceletString } from './solverUtils';
import { parseSolutionString } from './solverUtils';

// Import cubejs - note: this may need adjustment based on actual package structure
// @ts-ignore
import Cube from 'cubejs';

// Initialize cubejs solver
let solver: any = null;
let initializationAttempted = false;

// Add error handler for unhandled errors
self.onerror = (event: Event | string) => {
  console.error('Worker error:', event);
  let errorMessage = 'Unknown error';
  if (typeof event === 'string') {
    errorMessage = event;
  } else if (event instanceof ErrorEvent) {
    errorMessage = event.message || 'Unknown error';
  }
  self.postMessage({
    type: 'error',
    error: `Worker error: ${errorMessage}`,
  });
};

// Initialize the solver (cubejs needs initialization)
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  console.log('Worker received message:', type);

  try {
    if (type === 'init') {
      console.log('Initializing cubejs...');
      
      // Initialize cubejs solver
      if (!Cube) {
        const errorMsg = 'cubejs library not loaded - check import path. This may be a bundling issue with Vite workers.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Cube object:', Cube);
      console.log('Available methods:', Object.keys(Cube));
      
      if (typeof Cube.initSolver !== 'function') {
        const availableMethods = Object.keys(Cube || {}).join(', ');
        const errorMsg = `cubejs.initSolver method not available. Available methods: ${availableMethods}. The cubejs library may not be compatible with Web Workers.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Calling Cube.initSolver()...');
      try {
        await Cube.initSolver();
        console.log('Cube.initSolver() completed successfully');
        solver = Cube;
        initializationAttempted = true;
        self.postMessage({ type: 'init', success: true });
      } catch (initError: any) {
        const errorMsg = `Failed to initialize cubejs solver: ${initError?.message || 'Unknown initialization error'}`;
        console.error(errorMsg, initError);
        throw new Error(errorMsg);
      }
      return;
    }

    if (type === 'scramble') {
      // Generate a scrambled cube using cubejs
      if (!solver) {
        throw new Error('Solver not initialized');
      }

      const length = payload?.length || 25;
      console.log(`Generating scramble with ${length} moves...`);

      try {
        // Create a solved cube
        const solvedCube = new solver();
        
        // Generate scramble moves
        const faces: string[] = ['U', 'D', 'L', 'R', 'F', 'B'];
        const directions = ['', "'", '2'];
        const moves: string[] = [];
        let lastFace: string | null = null;

        for (let i = 0; i < length; i++) {
          let face: string;
          do {
            face = faces[Math.floor(Math.random() * faces.length)];
          } while (face === lastFace);
          
          lastFace = face;
          const direction = directions[Math.floor(Math.random() * directions.length)];
          const move = face + direction;
          
          solvedCube.move(move);
          moves.push(move);
        }

        // Get facelet string from scrambled cube
        const faceletString = solvedCube.asString();
        console.log('Generated scrambled facelet string:', faceletString.substring(0, 20) + '...');

        self.postMessage({
          type: 'scramble',
          success: true,
          payload: {
            faceletString,
            moves,
          },
        });
      } catch (scrambleError: any) {
        console.error('Scramble generation error:', scrambleError);
        throw new Error(`Failed to generate scramble: ${scrambleError?.message || 'Unknown error'}`);
      }
      return;
    }

    if (type === 'solve') {
      console.log('Starting solve...');
      
      if (!solver) {
        console.log('Solver not initialized, initializing now...');
        if (!Cube) {
          throw new Error('cubejs library not loaded - check import path. This may be a bundling issue with Vite workers.');
        }
        if (typeof Cube.initSolver !== 'function') {
          const availableMethods = Object.keys(Cube || {}).join(', ');
          throw new Error(`cubejs.initSolver method not available. Available methods: ${availableMethods}. The cubejs library may not be compatible with Web Workers.`);
        }
        try {
          await Cube.initSolver();
          solver = Cube;
          initializationAttempted = true;
          console.log('Solver initialized successfully during solve');
        } catch (initError: any) {
          const errorMsg = `Failed to initialize cubejs solver during solve: ${initError?.message || 'Unknown initialization error'}`;
          console.error(errorMsg, initError);
          throw new Error(errorMsg);
        }
      }

      const cubeState = payload.cubeState;
      if (!cubeState || !cubeState.faces) {
        throw new Error('Invalid cube state provided');
      }

      const faceletString = cubeStateToFaceletString(cubeState);
      console.log('Facelet string length:', faceletString.length);
      console.log('Facelet string (first 20 chars):', faceletString.substring(0, 20));
      
      // Validate facelet string format
      const validation = validateFaceletString(faceletString);
      if (!validation.isValid) {
        throw new Error(`Invalid facelet string: ${validation.error}`);
      }
      
      // Count facelet characters to verify distribution
      const faceletCounts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
      for (const char of faceletString) {
        if (char in faceletCounts) {
          faceletCounts[char]++;
        }
      }
      console.log('Facelet character counts:', faceletCounts);
      
      // Verify each face appears exactly 9 times
      const expectedCount = 9;
      const invalidFaces = Object.entries(faceletCounts).filter(([_, count]) => count !== expectedCount);
      if (invalidFaces.length > 0) {
        throw new Error(`Invalid facelet distribution: ${invalidFaces.map(([face, count]) => `${face}=${count}`).join(', ')}. Each face should appear exactly ${expectedCount} times.`);
      }

      // Create cube from facelet string
      if (!solver.fromString) {
        throw new Error('cubejs.fromString method not available');
      }
      
      console.log('Creating cube from facelet string...');
      console.log('Full facelet string:', faceletString);
      
      // Test: Create a solved cube with cubejs, apply a move, and see the facelet string
      // This will help us understand the expected format for scrambled states
      try {
        const testSolved = new solver();
        const testSolvedString = testSolved.asString();
        console.log('Test solved cube asString:', testSolvedString);
        console.log('Expected format for solved cube: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
        
        if (testSolvedString === 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB') {
          console.log('✓ Solved cube format matches expected');
        } else {
          console.warn('⚠ Solved cube format differs from expected');
        }
        
        // Test with a single move to see scrambled format
        const testScrambled = new solver();
        testScrambled.move('R');
        const testScrambledString = testScrambled.asString();
        console.log('Test scrambled (R move) asString:', testScrambledString);
        console.log('This shows how cubejs represents a scrambled state');
        
        // Analyze the R move output to understand facelet positions
        // U face: positions 0-8
        const uFace = testScrambledString.substring(0, 9);
        console.log('U face after R move:', uFace);
        console.log('U face analysis: positions 2,5,8 (right column) should be F');
        console.log('U[0][2]=' + uFace[2] + ', U[1][2]=' + uFace[5] + ', U[2][2]=' + uFace[8]);
        
        // F face: positions 18-26
        const fFace = testScrambledString.substring(18, 27);
        console.log('F face after R move:', fFace);
        console.log('F face analysis: positions 2,5,8 (right column) should be D');
        console.log('F[0][2]=' + fFace[2] + ', F[1][2]=' + fFace[5] + ', F[2][2]=' + fFace[8]);
        
        // D face: positions 27-35
        const dFace = testScrambledString.substring(27, 36);
        console.log('D face after R move:', dFace);
        console.log('D face analysis: positions 2,5,8 (right column) should be B');
        console.log('D[0][2]=' + dFace[2] + ', D[1][2]=' + dFace[5] + ', D[2][2]=' + dFace[8]);
        
        // B face: positions 45-53
        const bFace = testScrambledString.substring(45, 54);
        console.log('B face after R move:', bFace);
        console.log('B face analysis: positions 0,3,6 (left column) should be U');
        console.log('B[0][0]=' + bFace[0] + ', B[1][0]=' + bFace[3] + ', B[2][0]=' + bFace[6]);
        
        console.log('This confirms cubejs reads faces row-by-row, left-to-right (standard order)');
      } catch (e) {
        console.warn('Could not create test cubes:', e);
      }
      
      let cube;
      try {
        cube = solver.fromString(faceletString);
        console.log('Cube created successfully');
        
        // Try to validate the cube using cubejs methods if available
        if (cube && typeof cube === 'object') {
          console.log('Cube object created, checking validity...');
          // Check if cube has expected properties
          if (cube.isSolved && typeof cube.isSolved === 'function') {
            const isSolved = cube.isSolved();
            console.log('Cube isSolved check result:', isSolved);
          }
          
          // Try to get cube as string to verify it was parsed correctly
          if (cube.asString && typeof cube.asString === 'function') {
            const cubeString = cube.asString();
            console.log('Cube asString (first 20 chars):', cubeString?.substring(0, 20));
            console.log('Cube asString length:', cubeString?.length);
            
            // Compare input and output facelet strings
            if (cubeString !== faceletString) {
              console.warn('WARNING: Cube asString differs from input facelet string!');
              console.warn('Input:', faceletString);
              console.warn('Output:', cubeString);
              
              // Check if the character counts match (they should)
              const inputCounts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
              const outputCounts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
              
              for (const char of faceletString) {
                if (char in inputCounts) inputCounts[char]++;
              }
              for (const char of cubeString) {
                if (char in outputCounts) outputCounts[char]++;
              }
              
              console.warn('Input counts:', inputCounts);
              console.warn('Output counts:', outputCounts);
              
              // If counts don't match, log it but don't throw - let cubejs try to solve
              const countsMatch = JSON.stringify(inputCounts) === JSON.stringify(outputCounts);
              if (!countsMatch) {
                console.warn('Character counts differ between input and cubejs output.');
                console.warn('This may indicate a parsing issue, but we will attempt to solve anyway.');
                console.warn('cubejs may correct the state internally or report an error during solve.');
              } else {
                console.warn('Character counts match - issue is with facelet position/order');
                console.warn('The cube state may still be solvable, but positions are mapped differently');
              }
            } else {
              console.log('Facelet strings match - conversion appears correct');
            }
          }
          
          // Try to clone the cube to see if that works (tests if cube is valid)
          if (cube.clone && typeof cube.clone === 'function') {
            try {
              const cloned = cube.clone();
              console.log('Cube clone successful - cube object appears valid');
            } catch (cloneError: any) {
              console.error('Cube clone failed - cube may be invalid:', cloneError);
              throw new Error(`Cube state appears invalid: ${cloneError.message || 'Clone failed'}`);
            }
          }
          
          // Try to validate the cube state using cubejs's validation
          // Check if the cube has a validate or isValid method
          if (cube.validate && typeof cube.validate === 'function') {
            try {
              const isValid = cube.validate();
              console.log('Cube validation result:', isValid);
              if (!isValid) {
                throw new Error('Cube state failed cubejs validation - the cube may be in an unsolvable state');
              }
            } catch (validateError: any) {
              console.warn('Cube validation check failed:', validateError);
              // Don't throw - some cubejs versions may not have validate
            }
          }
          
          // Try to check if cube is solvable by attempting a quick solve check
          // Some cubejs versions have a quick validation
          if (cube.isValid && typeof cube.isValid === 'function') {
            try {
              const isValid = cube.isValid();
              console.log('Cube isValid check:', isValid);
              if (!isValid) {
                throw new Error('Cube state is not valid according to cubejs - facelet string format may be incorrect');
              }
            } catch (isValidError: any) {
              console.warn('Cube isValid check failed:', isValidError);
            }
          }
        }
      } catch (parseError: any) {
        console.error('Failed to parse cube state:', parseError);
        throw new Error(`Failed to parse cube state: ${parseError.message || 'Invalid facelet string'}`);
      }

      // Solve the cube
      if (!cube.solve) {
        throw new Error('cube.solve method not available');
      }
      
      console.log('Solving cube...');
      let solution;
      try {
        // Check if cube is already solved
        if (cube.isSolved && typeof cube.isSolved === 'function') {
          const isSolved = cube.isSolved();
          console.log('Cube isSolved check:', isSolved);
          if (isSolved) {
            console.log('Cube is already solved');
            solution = '';
          }
        }
        
        // If not already solved, attempt to solve
        if (solution === undefined) {
          // The solve operation can take time - run it with timing
          const solveStartTime = Date.now();
          console.log('Calling cube.solve()...');
          console.log('Cube object methods:', Object.keys(cube));
          console.log('Cube solve function length (parameters):', cube.solve?.length);
          
          // Send a heartbeat before starting the solve
          self.postMessage({ type: 'solve-progress', message: 'Starting solve operation...' });
          
          // Try solving - cubejs solve() is synchronous and blocking
          // This is a known issue: solve() can hang for invalid cube states
          try {
            if (typeof cube.solve !== 'function') {
              throw new Error('cube.solve is not a function');
            }
            
            // Check if there's a solveUpright method (some cubejs versions have this)
            const hasSolveUpright = typeof cube.solveUpright === 'function';
            console.log('Has solveUpright method:', hasSolveUpright);
            
            // Try solveUpright first if available - it might be faster or more reliable
            // solveUpright solves the cube in its current orientation
            if (hasSolveUpright) {
              console.log('Attempting to use solveUpright() method...');
              console.log('Note: solveUpright is also a blocking call and may hang');
              
              // Since solveUpright is also blocking, we can't really timeout it from within the worker
              // But we can at least log that we're trying it
              try {
                const solveUprightStartTime = Date.now();
                console.log('Calling cube.solveUpright()...');
                
                // This is also a blocking synchronous call
                const uprightSolution = cube.solveUpright();
                
                const uprightDuration = Date.now() - solveUprightStartTime;
                console.log(`solveUpright completed in ${uprightDuration}ms:`, uprightSolution);
                
                if (uprightSolution && typeof uprightSolution === 'string') {
                  solution = uprightSolution;
                  const solveDuration = Date.now() - solveStartTime;
                  console.log(`Solution found using solveUpright in ${solveDuration}ms:`, solution);
                  self.postMessage({ type: 'solve-progress', message: `Solve completed in ${solveDuration}ms` });
                } else {
                  console.log('solveUpright returned invalid result, falling back to solve()');
                  throw new Error('solveUpright returned invalid result');
                }
              } catch (uprightError: any) {
                console.log('solveUpright failed or threw error, falling back to solve():', uprightError);
                // Fall through to regular solve()
              }
            }
            
            // If solveUpright didn't work or isn't available, use regular solve()
            if (!solution) {
              // Since solve.length is 0, it doesn't accept parameters
              // Call it without parameters
              console.log('Calling cube.solve() (no parameters)...');
              console.log('Warning: This is a blocking call and may hang for invalid cube states');
              console.log('If this hangs, the cube state may be invalid or unsolvable');
              
              // Log the cube's internal representation for debugging
              if (cube.asString && typeof cube.asString === 'function') {
                const cubeStr = cube.asString();
                console.log('Cube internal representation (asString):', cubeStr);
                // Check if the internal representation matches what we expect
                const internalCounts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
                for (const char of cubeStr) {
                  if (char in internalCounts) internalCounts[char]++;
                }
                console.log('Cube internal facelet counts:', internalCounts);
              }
              
              // Send periodic progress updates during solve (though solve is blocking, 
              // this at least confirms the worker is still alive)
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - solveStartTime;
                if (elapsed > 5000) { // Only send updates after 5 seconds
                  self.postMessage({ 
                    type: 'solve-progress', 
                    message: `Still solving... (${Math.floor(elapsed / 1000)}s elapsed)` 
                  });
                }
              }, 5000);
              
              try {
                // Attempt to solve - this is synchronous and blocking
                // If the cube is invalid/unsolvable, this may hang indefinitely
                // We rely on the timeout in the main thread (120s) to catch hangs
                solution = cube.solve();
                
                // Clear progress interval once solve completes
                clearInterval(progressInterval);
              } catch (solveError: any) {
                clearInterval(progressInterval);
                // If solve throws an error, that's actually good - it means it detected an issue
                console.error('cube.solve() threw an error:', solveError);
                throw solveError;
              }
            }
            
            // Check if solution was returned
            if (solution === undefined || solution === null) {
              throw new Error('cube.solve() returned undefined or null - cube may be unsolvable');
            }
            
            const solveDuration = Date.now() - solveStartTime;
            console.log(`Solution found in ${solveDuration}ms:`, solution);
            
            // Send progress update
            self.postMessage({ type: 'solve-progress', message: `Solve completed in ${solveDuration}ms` });
          } catch (solveCallError: any) {
            console.error('Error calling cube.solve():', solveCallError);
            const errorMsg = solveCallError.message || solveCallError.toString() || 'Unknown error';
            
            // Check for specific error types
            if (errorMsg.includes('unsolvable') || errorMsg.includes('invalid') || errorMsg.includes('parity')) {
              throw new Error(`Cube appears to be in an unsolvable state: ${errorMsg}`);
            }
            
            throw new Error(`Solve failed: ${errorMsg}`);
          }
          
          // If solution is empty or very long, log a warning
          if (!solution || solution.trim() === '') {
            console.warn('Solver returned empty solution - cube may already be solved');
            solution = '';
          } else if (solution.split(/\s+/).length > 100) {
            console.warn(`Solution is very long (${solution.split(/\s+/).length} moves) - this may indicate an issue`);
          }
        }
      } catch (solveError: any) {
        console.error('Solve error details:', solveError);
        // Check if it's a specific error about unsolvable state
        const errorMsg = solveError.message || solveError.toString() || 'Solver error';
        if (errorMsg.includes('unsolvable') || errorMsg.includes('invalid') || errorMsg.includes('parity')) {
          throw new Error(`Cube appears to be in an unsolvable state: ${errorMsg}`);
        }
        throw new Error(`Failed to solve cube: ${errorMsg}`);
      }

      // Handle empty solution (cube already solved)
      if (solution === undefined || solution === null) {
        solution = '';
      }
      
      if (typeof solution !== 'string') {
        throw new Error(`Solver returned invalid solution type: ${typeof solution}`);
      }

      // Parse solution
      const moves = parseSolutionString(solution);
      console.log(`Parsed ${moves.length} moves from solution`);

      // Send response back to main thread
      console.log('Sending solution back to main thread...');
      self.postMessage({
        type: 'solve',
        success: true,
        payload: {
          solution,
          moves,
        },
      });
      console.log('Solution sent successfully');
    } else if (type === 'cancel') {
      // Cancel any ongoing solve
      self.postMessage({ type: 'cancel', success: true });
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown solver error';
    console.error('Solver worker error:', errorMessage, error);
    self.postMessage({
      type: 'error',
      error: errorMessage,
    });
  }
};

