import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useSelector, useDispatch } from 'react-redux';
import type { CubeState } from '../../models/CubeState';
import type { Face, Color } from '../../utils/colorUtils';
import type { Move } from '../../models/Move';
import type { RootState, AppDispatch } from '../../store';
import { AnimatedCubie } from './AnimatedCubie';
import { Group } from 'three';
import { setCubeState } from '../../store/slices/cubeSlice';
import { CubeEngine } from '../../engine/CubeEngine';

interface Cube3DProps {
  cubeState: CubeState;
  onFaceClick?: (face: Face) => void;
  activeFace?: Face | null;
}

// Easing function for smooth animation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Get rotation axis and angle for a face rotation
 */
function getRotationAxisAndAngle(face: Face, direction: number): { axis: 'x' | 'y' | 'z'; angle: number } {
  const baseAngle = (Math.PI / 2) * (direction === 2 ? 2 : direction);
  
  switch (face) {
    case 'U': return { axis: 'y', angle: -baseAngle };
    case 'D': return { axis: 'y', angle: baseAngle };
    case 'L': return { axis: 'x', angle: baseAngle };
    case 'R': return { axis: 'x', angle: -baseAngle };
    case 'F': return { axis: 'z', angle: -baseAngle };
    case 'B': return { axis: 'z', angle: baseAngle };
  }
}

/**
 * Floating animation for the cube group
 */
function FloatingCube({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
}

interface AnimatedCubeProps {
  cubeState: CubeState;
  currentMove: Move | null;
  animationProgress: number;
  targetAngle: number;
  axis: 'x' | 'y' | 'z';
}

/**
 * The actual 3D cube with all cubies
 */
function AnimatedCube({ cubeState, currentMove, animationProgress, targetAngle, axis }: AnimatedCubeProps) {
  const cubies = useMemo(() => {
    const cubieData: Array<{
      id: string;
      position: [number, number, number];
      colors: Partial<Record<Face, Color>>;
    }> = [];

    const offset = 1.05;
    const start = -offset;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const position: [number, number, number] = [
            start + x * offset,
            start + y * offset,
            start + z * offset,
          ];

          // Create stable ID based on grid position (this stays constant)
          // The grid position represents where the cubie "slot" is, not the cubie itself
          const id = `${x}-${y}-${z}`;

          const colors: Partial<Record<Face, Color>> = {};

          // Map colors from cubeState based on current grid position
          // After a rotation, the cubeState correctly reflects where each color is
          // We read from the face arrays at this grid position to get the current colors
          if (y === 2) colors.U = cubeState.faces.U[2 - z][x];
          if (y === 0) colors.D = cubeState.faces.D[z][2 - x];
          if (x === 0) colors.L = cubeState.faces.L[2 - z][2 - y];
          if (x === 2) colors.R = cubeState.faces.R[z][2 - y];
          if (z === 2) colors.F = cubeState.faces.F[2 - y][x];
          if (z === 0) colors.B = cubeState.faces.B[2 - y][2 - x];

          cubieData.push({ id, position, colors });
        }
      }
    }

    return cubieData;
  }, [cubeState]);

  return (
    <group>
      {cubies.map((cubie) => (
        <AnimatedCubie
          key={cubie.id}
          position={cubie.position}
          colors={cubie.colors}
          size={1}
          gap={0.04}
          currentMove={currentMove}
          animationProgress={animationProgress}
          targetAngle={targetAngle}
          axis={axis}
        />
      ))}
    </group>
  );
}

interface CubeSceneProps {
  displayState: CubeState;
  currentMove: Move | null;
  animationProgress: number;
  targetAngle: number;
  axis: 'x' | 'y' | 'z';
}

/**
 * Main 3D scene with lighting and controls
 */
function CubeScene({ displayState, currentMove, animationProgress, targetAngle, axis }: CubeSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={45} />
      
      {/* Professional lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.0} 
        castShadow
        color="#ffffff"
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.4} 
        color="#ffffff"
      />
      <pointLight 
        position={[0, -5, 0]} 
        intensity={0.3} 
        color="#ffffff"
      />
      
      <Environment preset="sunset" />
      
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        autoRotate={false}
        enableDamping
        dampingFactor={0.05}
      />

      <FloatingCube>
        <AnimatedCube 
          cubeState={displayState}
          currentMove={currentMove}
          animationProgress={animationProgress}
          targetAngle={targetAngle}
          axis={axis}
        />
      </FloatingCube>
      
      {/* Ground reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </>
  );
}

/**
 * Animation controller component - runs inside Canvas
 */
function AnimationController({
  moveQueue,
  onAnimationComplete,
  speed,
  setProgress,
  setCurrentMove,
  setAxis,
  setTargetAngle,
}: {
  moveQueue: Move[];
  onAnimationComplete: (move: Move) => void;
  speed: number;
  setProgress: (p: number) => void;
  setCurrentMove: (m: Move | null) => void;
  setAxis: (a: 'x' | 'y' | 'z') => void;
  setTargetAngle: (a: number) => void;
}) {
  const currentMoveRef = useRef<Move | null>(null);
  const startTimeRef = useRef<number>(0);
  const animatingRef = useRef(false);
  const duration = 0.35 / speed;

  useFrame(() => {
    // Start next animation if queue has items and not currently animating
    if (!animatingRef.current && moveQueue.length > 0) {
      const nextMove = moveQueue[0];
      currentMoveRef.current = nextMove;
      animatingRef.current = true;
      startTimeRef.current = performance.now();
      
      const { axis, angle } = getRotationAxisAndAngle(nextMove.face, nextMove.direction);
      setAxis(axis);
      setTargetAngle(angle);
      setCurrentMove(nextMove);
      setProgress(0);
    }
    
    // Continue animation
    if (animatingRef.current && currentMoveRef.current) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);
      
      setProgress(easedProgress);
      
      // Animation complete
      if (rawProgress >= 1) {
        const completedMove = currentMoveRef.current;
        animatingRef.current = false;
        currentMoveRef.current = null;
        setProgress(0);
        setCurrentMove(null);
        onAnimationComplete(completedMove);
      }
    }
  });

  return null;
}

export function Cube3D({ cubeState }: Cube3DProps) {
  const dispatch = useDispatch<AppDispatch>();
  const playback = useSelector((state: RootState) => state.ui.playback);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const solveSteps = useSelector((state: RootState) => state.solve.steps);
  const initialState = useSelector((state: RootState) => state.solve.initialState);
  
  // Animation state
  const [moveQueue, setMoveQueue] = useState<Move[]>([]);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [axis, setAxis] = useState<'x' | 'y' | 'z'>('y');
  const [targetAngle, setTargetAngle] = useState(0);
  
  // Display state (what we show, may be mid-animation)
  const [displayState, setDisplayState] = useState<CubeState>(cubeState);
  
  // Track the step index that displayState currently reflects
  // -1 means we're showing the initial state (before any moves)
  const displayedStepRef = useRef<number>(-1);
  const prevModeRef = useRef(mode);

  // Reset when entering/leaving solve mode
  useEffect(() => {
    if (mode === 'solve' && prevModeRef.current !== 'solve') {
      // Entering solve mode - reset to initial state
      displayedStepRef.current = -1;
      setDisplayState({ ...initialState });
      setMoveQueue([]);
    } else if (mode !== 'solve' && prevModeRef.current === 'solve') {
      // Leaving solve mode - sync with current cube state
      displayedStepRef.current = -1;
      setDisplayState({ ...cubeState });
      setMoveQueue([]);
    }
    prevModeRef.current = mode;
  }, [mode, initialState, cubeState]);

  // Handle step changes in solve mode
  useEffect(() => {
    if (mode !== 'solve' || solveSteps.length === 0) return;
    
    const targetStep = playback.currentStepIndex;
    const currentDisplayed = displayedStepRef.current;
    
    // If we're at step -1, ensure we show the initial scrambled state
    if (targetStep === -1 && currentDisplayed !== -1) {
      // Reset to initial state
      displayedStepRef.current = -1;
      setDisplayState({ ...initialState });
      setMoveQueue([]);
      return;
    }
    
    // If target is different from what we're displaying, queue moves to get there
    if (targetStep !== currentDisplayed && targetStep >= 0) {
      // Calculate how many steps to move and in which direction
      if (targetStep > currentDisplayed) {
        // Moving forward
        // Queue all moves from currentDisplayed+1 to targetStep
        const movesToAdd: Move[] = [];
        for (let i = currentDisplayed + 1; i <= targetStep; i++) {
          const step = solveSteps[i];
          if (step) {
            movesToAdd.push(step.move);
          }
        }
        if (movesToAdd.length > 0) {
          setMoveQueue(prev => [...prev, ...movesToAdd]);
        }
      } else if (targetStep < currentDisplayed) {
        // Moving backward
        // Queue reverse moves from currentDisplayed down to targetStep+1
        const movesToAdd: Move[] = [];
        for (let i = currentDisplayed; i > targetStep; i--) {
          const step = solveSteps[i];
          if (step) {
            const reverseMove: Move = {
              ...step.move,
              direction: step.move.direction === 2 ? 2 : -step.move.direction,
              notation: step.move.notation,
            };
            movesToAdd.push(reverseMove);
          }
        }
        if (movesToAdd.length > 0) {
          setMoveQueue(prev => [...prev, ...movesToAdd]);
        }
      }
      // Update the ref to target (will be reflected visually after animations complete)
      displayedStepRef.current = targetStep;
    }
  }, [mode, playback.currentStepIndex, solveSteps, initialState]);

  // Ensure step -1 always shows initial scrambled state
  useEffect(() => {
    if (mode === 'solve' && solveSteps.length > 0 && playback.currentStepIndex === -1) {
      // When at step -1, we should show the initial scrambled state
      if (displayedStepRef.current !== -1) {
        displayedStepRef.current = -1;
        setDisplayState({ ...initialState });
        setMoveQueue([]);
      }
    }
  }, [mode, solveSteps.length, playback.currentStepIndex, initialState]);

  // Sync display state with cube state when not in solve mode
  useEffect(() => {
    if (mode !== 'solve') {
      setDisplayState({ ...cubeState });
    }
  }, [cubeState, mode]);

  // Handle animation completion
  const handleAnimationComplete = useCallback((completedMove: Move) => {
    // Remove the completed move from queue
    setMoveQueue(prev => prev.slice(1));
    
    // Apply the completed move to the display state
    setDisplayState(prev => {
      const newState = CubeEngine.applyMove(prev, completedMove);
      return { ...newState };
    });
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15,23,42,0.3) 100%)',
        }}
      />
      
      {/* Animation indicator */}
      {currentMove && (
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span 
            className="text-lg font-bold"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {currentMove.notation}
          </span>
        </div>
      )}
      
      <Canvas shadows>
        <AnimationController
          moveQueue={moveQueue}
          onAnimationComplete={handleAnimationComplete}
          speed={playback.speed}
          setProgress={setAnimationProgress}
          setCurrentMove={setCurrentMove}
          setAxis={setAxis}
          setTargetAngle={setTargetAngle}
        />
        <CubeScene 
          displayState={displayState}
          currentMove={currentMove}
          animationProgress={animationProgress}
          targetAngle={targetAngle}
          axis={axis}
        />
      </Canvas>
      
    </div>
  );
}

