import { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Move } from '../models/Move';
import type { Face } from '../utils/colorUtils';

interface AnimationState {
  isAnimating: boolean;
  currentMove: Move | null;
  progress: number; // 0 to 1
  targetAngle: number;
  axis: 'x' | 'y' | 'z';
}

interface AnimationConfig {
  duration: number; // in seconds
  easing: (t: number) => number;
}

// Easing functions for smooth animations
export const easings = {
  // Smooth ease out cubic - feels natural for physical rotation
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  // Smooth ease in-out for more dramatic effect
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // Quick ease out for snappy feel
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  // Bounce effect at the end
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  // Elastic snap
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
};

const defaultConfig: AnimationConfig = {
  duration: 0.35,
  easing: easings.easeOutCubic,
};

/**
 * Get rotation axis and angle for a face rotation
 */
function getRotationAxisAndAngle(face: Face, direction: number): { axis: 'x' | 'y' | 'z'; angle: number } {
  // Direction: 1 = clockwise (when looking at face), -1 = counter-clockwise, 2 = 180°
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
 * Check if a cubie position is on a specific face
 */
function isCubieOnFace(position: [number, number, number], face: Face): boolean {
  const [x, y, z] = position;
  const threshold = 0.5; // Half of cubie size
  
  switch (face) {
    case 'U': return y > threshold;
    case 'D': return y < -threshold;
    case 'L': return x < -threshold;
    case 'R': return x > threshold;
    case 'F': return z > threshold;
    case 'B': return z < -threshold;
  }
}

export interface CubieData {
  position: [number, number, number];
  ref: React.RefObject<Group>;
}

export interface UseCubeAnimationReturn {
  animate: (move: Move, onComplete?: () => void) => void;
  animationState: AnimationState;
  registerCubie: (index: number, data: CubieData) => void;
  unregisterCubie: (index: number) => void;
  setSpeed: (speed: number) => void;
}

export function useCubeAnimation(config: Partial<AnimationConfig> = {}): UseCubeAnimationReturn {
  const finalConfig = { ...defaultConfig, ...config };
  const cubiesRef = useRef<Map<number, CubieData>>(new Map());
  const [speed, setSpeed] = useState(1);
  
  const animationRef = useRef<AnimationState>({
    isAnimating: false,
    currentMove: null,
    progress: 0,
    targetAngle: 0,
    axis: 'y',
  });
  
  const startRotationRef = useRef<Map<number, number>>(new Map());
  const onCompleteRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number>(0);

  const registerCubie = useCallback((index: number, data: CubieData) => {
    cubiesRef.current.set(index, data);
  }, []);

  const unregisterCubie = useCallback((index: number) => {
    cubiesRef.current.delete(index);
  }, []);

  const animate = useCallback((move: Move, onComplete?: () => void) => {
    if (animationRef.current.isAnimating) return;
    
    const { axis, angle } = getRotationAxisAndAngle(move.face, move.direction);
    
    // Store initial rotations for all cubies on this face
    startRotationRef.current.clear();
    cubiesRef.current.forEach((cubie, index) => {
      if (isCubieOnFace(cubie.position, move.face) && cubie.ref.current) {
        startRotationRef.current.set(index, cubie.ref.current.rotation[axis]);
      }
    });
    
    animationRef.current = {
      isAnimating: true,
      currentMove: move,
      progress: 0,
      targetAngle: angle,
      axis,
    };
    
    startTimeRef.current = 0;
    onCompleteRef.current = onComplete || null;
  }, []);

  // Animation loop using useFrame
  useFrame((_, delta) => {
    if (!animationRef.current.isAnimating || !animationRef.current.currentMove) return;
    
    if (startTimeRef.current === 0) {
      startTimeRef.current = performance.now();
    }
    
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const duration = finalConfig.duration / speed;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = finalConfig.easing(rawProgress);
    
    animationRef.current.progress = rawProgress;
    
    const { axis, targetAngle, currentMove } = animationRef.current;
    
    // Update rotating cubies
    cubiesRef.current.forEach((cubie, index) => {
      if (isCubieOnFace(cubie.position, currentMove.face) && cubie.ref.current) {
        const startRotation = startRotationRef.current.get(index) || 0;
        cubie.ref.current.rotation[axis] = startRotation + targetAngle * easedProgress;
      }
    });
    
    // Animation complete
    if (rawProgress >= 1) {
      animationRef.current.isAnimating = false;
      animationRef.current.currentMove = null;
      animationRef.current.progress = 0;
      
      if (onCompleteRef.current) {
        onCompleteRef.current();
        onCompleteRef.current = null;
      }
    }
  });

  return {
    animate,
    animationState: animationRef.current,
    registerCubie,
    unregisterCubie,
    setSpeed,
  };
}

